import {
  ChatMessage,
  MessageRoleDomain,
} from "../../domain/chat-message.entity";
import type { GeminiChatResponse } from "../../domain/gemini-response.type";
import type { ChatTurn, IAiService } from "../ports/ai-service";
import type { IChatMessageRepository } from "../ports/chat-message.repository";
import type { IChatRepository } from "../ports/chat.repository";

interface SendChatMessageInput {
  chatId: string;
  userId?: string;
  messageContent: string;
}

interface SendChatMessageOutput {
  userMessage: ChatMessage;
  assistantResponse: GeminiChatResponse | null;
  assistantMessage?: ChatMessage;
}

const MAX_HISTORY_TURNS = 20;

export class SendChatMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly chatMessageRepository: IChatMessageRepository,
    private readonly aiService: IAiService
  ) {}

  private convertDomainMessagesToChatTurns(
    messages: ChatMessage[]
  ): ChatTurn[] {
    return messages.map((msg) => ({
      role: msg.role === MessageRoleDomain.USER ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
  }

  async execute(input: SendChatMessageInput): Promise<SendChatMessageOutput> {
    const chat = await this.chatRepository.findById(input.chatId);
    if (!chat) {
      throw new Error("Chat session not found.");
    }

    if (chat.userId && input.userId && chat.userId !== input.userId) {
      throw new Error("Unauthorized to send message to this chat.");
    }

    let userMessageEntity: ChatMessage | null = null;
    if (chat.userId) {
      userMessageEntity = await this.chatMessageRepository.create({
        chatId: input.chatId,
        role: MessageRoleDomain.USER,
        content: input.messageContent,
      });
    } else {
      userMessageEntity = {
        id: crypto.randomUUID(),
        chatId: input.chatId,
        role: MessageRoleDomain.USER,
        content: input.messageContent,
        createdAt: new Date(),
      };
    }

    let historyToAI: ChatTurn[];
    if (chat.userId) {
      const dbHistory = await this.chatRepository.getHistory(
        input.chatId,
        MAX_HISTORY_TURNS
      );
      historyToAI = this.convertDomainMessagesToChatTurns(dbHistory);
    } else {
      historyToAI = [{ role: "user", parts: [{ text: input.messageContent }] }];
    }

    const assistantResponse = await this.aiService.generateChatContent(
      historyToAI,
      input.messageContent
    );

    let assistantMessageEntity: ChatMessage | undefined;
    if (
      assistantResponse &&
      typeof assistantResponse === "string" &&
      chat.userId
    ) {
      assistantMessageEntity = await this.chatMessageRepository.create({
        chatId: input.chatId,
        role: MessageRoleDomain.ASSISTANT,
        content: assistantResponse,
      });
    }

    return {
      userMessage: userMessageEntity,
      assistantResponse,
      assistantMessage: assistantMessageEntity,
    };
  }
}
