import type {
  ChatMessage,
  ChatMessageCreationData,
} from "../../domain/chat-message.entity";

export interface IChatMessageRepository {
  create(data: ChatMessageCreationData): Promise<ChatMessage>;
}
