import type { PaginatedResult, PaginateOptions } from "@/helpers/paginate";
import type { ChatMessage } from "../../domain/chat-message.entity";
import type { IChatMessageRepository } from "../ports/chat-message.repository";
import type { IChatRepository } from "../ports/chat.repository";

interface GetChatMessagesInput extends PaginateOptions {
  chatId: string;
  userId?: string;
}

export class GetChatMessagesUseCase {
  constructor(
    private readonly chatMessageRepository: IChatMessageRepository,
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(
    input: GetChatMessagesInput
  ): Promise<PaginatedResult<ChatMessage>> {
    const chat = await this.chatRepository.findById(input.chatId);
    if (!chat) {
      throw new Error("Chat session not found.");
    }

    if (chat.userId && chat.userId !== input.userId) {
      throw new Error("Unauthorized to access messages for this chat session.");
    }

    return this.chatMessageRepository.findByChatId(input.chatId, {
      page: input.page,
      perPage: input.perPage,
    });
  }
}
