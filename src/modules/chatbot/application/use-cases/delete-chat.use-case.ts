import type { IChatRepository } from "../ports/chat.repository";

interface DeleteChatInput {
  chatId: string;
  userId?: string;
}

export class DeleteChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(input: DeleteChatInput): Promise<boolean> {
    const chat = await this.chatRepository.findById(input.chatId);
    if (!chat) {
      throw new Error("Chat session not found.");
    }

    if (chat.userId && chat.userId !== input.userId) {
      throw new Error("Unauthorized to delete this chat session.");
    }

    return this.chatRepository.deleteById(input.chatId, input.userId);
  }
}
