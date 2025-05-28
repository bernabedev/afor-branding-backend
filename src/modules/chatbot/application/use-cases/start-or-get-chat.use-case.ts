import type { Chat } from "../../domain/chat.entity";
import type { IChatRepository } from "../ports/chat.repository";

interface StartOrGetChatInput {
  chatId?: string;
  userId?: string | null;
}

export class StartOrGetChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(input: StartOrGetChatInput): Promise<Chat> {
    if (input.chatId) {
      const existingChat = await this.chatRepository.findById(input.chatId);
      if (existingChat) {
        if (
          existingChat.userId &&
          input.userId &&
          existingChat.userId !== input.userId
        ) {
          throw new Error("Access denied to this chat session.");
        }
        return existingChat;
      }
    }
    return this.chatRepository.create({ userId: input.userId });
  }
}
