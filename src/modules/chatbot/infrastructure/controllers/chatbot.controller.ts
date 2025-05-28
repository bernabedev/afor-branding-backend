import { PrismaClient } from "@/generated/prisma";
import { Elysia, t } from "elysia";
import { CreateGeneratedPaletteUseCase } from "../../../palettes/application/use-cases/create-generated-palette.use-case";
import { PrismaGeneratedPaletteRepository } from "../../../palettes/infrastructure/repositories/prisma-generated-palette.repository";
import { ReactToChatMessageUseCase } from "../../application/use-cases/react-to-chat-message.use-case";
import type { SendChatMessageUseCase } from "../../application/use-cases/send-chat-message.use-case";
import type { StartChatSessionUseCase } from "../../application/use-cases/start-chat-session.use-case";
import { PaletteColor } from "../../domain/palette.entity";

const sendMessageBodySchema = t.Object({
  message: t.String({ minLength: 1 }),
  chatId: t.Optional(t.String({ format: "uuid" })),
});

interface ChatbotControllerDependencies {
  startChatSessionUseCase: StartChatSessionUseCase;
  sendChatMessageUseCase: SendChatMessageUseCase;
  reactToChatMessageUseCase: ReactToChatMessageUseCase;
  prismaClient: PrismaClient;
}

export const chatbotController = (deps: ChatbotControllerDependencies) => {
  const {
    startChatSessionUseCase,
    sendChatMessageUseCase,
    reactToChatMessageUseCase,
    prismaClient,
  } = deps;

  const generatedPaletteRepository = new PrismaGeneratedPaletteRepository(
    prismaClient
  );

  const createGeneratedPaletteUseCase = new CreateGeneratedPaletteUseCase(
    generatedPaletteRepository
  );

  return new Elysia({ prefix: "/chatbot" })
    .post(
      "/message",
      async ({ body, set, userAuth }) => {
        const currentUserId = userAuth?.sub;

        try {
          const chatSession = await startChatSessionUseCase.execute({
            chatId: body.chatId,
            userId: currentUserId,
          });

          const result = await sendChatMessageUseCase.execute({
            chatId: chatSession.id,
            userId: currentUserId,
            messageContent: body.message,
          });

          let responseType = "text";
          if (
            result.assistantResponse &&
            typeof result.assistantResponse !== "string"
          ) {
            if (
              Array.isArray(result.assistantResponse) &&
              result.assistantResponse.length > 0
            ) {
              const firstItem = result.assistantResponse[0];
              if (typeof firstItem === "object" && firstItem !== null) {
                if (
                  "key" in firstItem &&
                  "name" in firstItem &&
                  "type" in firstItem
                ) {
                  responseType = "fonts";
                } else if (
                  "value" in firstItem &&
                  "name" in firstItem &&
                  "color" in firstItem
                ) {
                  responseType = "palette";
                  if (Array.isArray(result.assistantResponse)) {
                    console.log({
                      paletteColors: result.assistantResponse,
                    });
                    createGeneratedPaletteUseCase.execute({
                      userId: currentUserId,
                      colors: result.assistantResponse as PaletteColor[],
                    });
                  }
                }
              }
            }
          }

          return {
            chatId: chatSession.id,
            userMessage: result.userMessage.content,
            response: result.assistantResponse,
            type: responseType,
            message: result.assistantResponse
              ? "Response generated"
              : "No response from assistant",
          };
        } catch (error: any) {
          console.error("Chatbot message error:", error);
          set.status = error.message.includes("Unauthorized")
            ? 403
            : error.message.includes("not found")
            ? 404
            : 400;
          return { error: error.message || "Failed to process chat message" };
        }
      },
      {
        body: sendMessageBodySchema,
        detail: {
          tags: ["Chatbot"],
          summary: "Send a message to the chatbot",
          description:
            "Starts a new chat or continues an existing one. Saves history for logged-in users.",
        },
      }
    )
    .post(
      "/messages/:messageId/react",
      async ({ params, body, userAuth, set }) => {
        if (!userAuth) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
        try {
          const updatedMessage = await reactToChatMessageUseCase.execute({
            messageId: params.messageId,
            reaction: body.reaction,
            userId: userAuth.sub,
          });
          return {
            message: "Reaction updated successfully",
            chatMessage: updatedMessage,
          };
        } catch (error: any) {
          console.error("React to message error:", error);
          if (error.message.includes("not found")) {
            set.status = 404;
          } else if (error.message.includes("Unauthorized")) {
            set.status = 403;
          } else {
            set.status = 400;
          }
          return { error: error.message || "Failed to react to message" };
        }
      },
      {
        params: t.Object({
          messageId: t.String({ format: "uuid" }),
        }),
        body: t.Object({
          reaction: t.String({
            enum: ["LIKE", "DISLIKE"],
          }),
        }),
        detail: {
          tags: ["Chatbot"],
          summary: "React to a chat message (like/dislike)",
          description:
            "Allows a user to like, dislike, or remove a reaction from a message. Requires authentication.",
          security: [{ cookieAuth: [] }],
        },
      }
    );
};
