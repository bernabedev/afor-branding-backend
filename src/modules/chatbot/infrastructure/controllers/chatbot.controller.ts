import { Elysia, t } from "elysia";
import type { SendChatMessageUseCase } from "../../application/use-cases/send-chat-message.use-case";
import type { StartChatSessionUseCase } from "../../application/use-cases/start-chat-session.use-case";

const sendMessageBodySchema = t.Object({
  message: t.String({ minLength: 1 }),
  chatId: t.Optional(t.String({ format: "uuid" })),
});

interface ChatbotControllerDependencies {
  startChatSessionUseCase: StartChatSessionUseCase;
  sendChatMessageUseCase: SendChatMessageUseCase;
}

export const chatbotController = (deps: ChatbotControllerDependencies) => {
  const { startChatSessionUseCase, sendChatMessageUseCase } = deps;

  return new Elysia({ prefix: "/chatbot" }).post(
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
  );
};
