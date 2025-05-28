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
  userId?: string | null;
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
      throw new Error("Access denied to this chat session.");
    }

    const userMessageEntity = await this.chatMessageRepository.create({
      chatId: input.chatId,
      role: MessageRoleDomain.USER,
      content: input.messageContent,
    });

    const dbHistory = await this.chatRepository.getHistory(
      input.chatId,
      MAX_HISTORY_TURNS
    );
    const historyToAI = this.convertDomainMessagesToChatTurns(dbHistory);

    const assistantResponse = await this.aiService.generateChatContent(
      historyToAI,
      input.messageContent
    );

    let assistantMessageEntity: ChatMessage | undefined;
    if (assistantResponse && typeof assistantResponse === "string") {
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
