import { PrismaClient } from "@/generated/prisma";
import { DeleteChatUseCase } from "./application/use-cases/delete-chat.use-case";
import { GetChatMessagesUseCase } from "./application/use-cases/get-chat-messages.use-case";
import { GetChatsUseCase } from "./application/use-cases/get-chats.use-case";
import { ReactToChatMessageUseCase } from "./application/use-cases/react-to-chat-message.use-case";
import { SendChatMessageUseCase } from "./application/use-cases/send-chat-message.use-case";
import { StartChatSessionUseCase } from "./application/use-cases/start-chat-session.use-case";
import { chatbotController } from "./infrastructure/controllers/chatbot.controller";
import { PrismaChatMessageRepository } from "./infrastructure/repositories/prisma-chat-message.repository";
import { PrismaChatRepository } from "./infrastructure/repositories/prisma-chat.repository";
import { GeminiAiService } from "./infrastructure/services/gemini-ai.service";

interface ChatbotModuleDependencies {
  prisma: PrismaClient;
}

export const chatbotModule = (deps: ChatbotModuleDependencies) => {
  const { prisma } = deps;

  // Infrastructure
  const chatRepository = new PrismaChatRepository(prisma);
  const chatMessageRepository = new PrismaChatMessageRepository(prisma);
  const aiService = new GeminiAiService();

  // Application Use Cases
  const startChatSessionUseCase = new StartChatSessionUseCase(chatRepository);
  const sendChatMessageUseCase = new SendChatMessageUseCase(
    chatRepository,
    chatMessageRepository,
    aiService
  );
  const reactToChatMessageUseCase = new ReactToChatMessageUseCase(
    chatMessageRepository,
    chatRepository
  );
  const getChatsUseCase = new GetChatsUseCase(chatRepository);
  const deleteChatUseCase = new DeleteChatUseCase(chatRepository);
  const getChatMessagesUseCase = new GetChatMessagesUseCase(
    chatMessageRepository,
    chatRepository
  );

  // Controller
  return chatbotController({
    startChatSessionUseCase,
    sendChatMessageUseCase,
    reactToChatMessageUseCase,
    getChatsUseCase,
    deleteChatUseCase,
    getChatMessagesUseCase,
    prismaClient: prisma,
  });
};
