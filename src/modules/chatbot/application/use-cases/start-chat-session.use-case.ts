import type { Chat } from "../../domain/chat.entity";
import type { IChatRepository } from "../ports/chat.repository";

interface StartChatSessionInput {
  chatId?: string;
  userId?: string;
}

export class StartChatSessionUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(input: StartChatSessionInput): Promise<Chat> {
    if (input.chatId) {
      const existingChat = await this.chatRepository.findById(input.chatId);
      if (existingChat) {
        if (
          existingChat.userId &&
          input.userId &&
          existingChat.userId !== input.userId
        ) {
          console.warn(
            `User ${input.userId} tried to access chat ${input.chatId} of user ${existingChat.userId}. Creating new chat.`
          );
          return this.chatRepository.create({ userId: input.userId });
        }

        return existingChat;
      }
    }

    return this.chatRepository.create({ userId: input.userId });
  }
}
