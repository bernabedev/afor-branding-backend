import type {
  ChatMessage,
  MessageReactionDomain,
} from "../../domain/chat-message.entity";
import type { IChatMessageRepository } from "../ports/chat-message.repository";
import type { IChatRepository } from "../ports/chat.repository";

interface ReactToChatMessageInput {
  messageId: string;
  reaction: MessageReactionDomain | null;
  userId?: string;
}

export class ReactToChatMessageUseCase {
  constructor(
    private readonly chatMessageRepository: IChatMessageRepository,
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(input: ReactToChatMessageInput): Promise<ChatMessage> {
    const message = await this.chatMessageRepository.findById(input.messageId);
    if (!message) {
      throw new Error("Message not found.");
    }

    const chat = await this.chatRepository.findById(message.chatId);
    if (!chat) {
      throw new Error("Chat session not found for this message.");
    }

    if (chat.userId && input.userId && chat.userId !== input.userId) {
      throw new Error("Unauthorized to react to this message.");
    }

    return this.chatMessageRepository.updateReaction(
      input.messageId,
      input.reaction
    );
  }
}
