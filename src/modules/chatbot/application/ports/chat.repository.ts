import type { ChatMessage } from "../../domain/chat-message.entity";
import type { Chat, ChatCreationData } from "../../domain/chat.entity";

export interface IChatRepository {
  findById(chatId: string): Promise<Chat | null>;
  create(data: ChatCreationData): Promise<Chat>;
  getHistory(chatId: string, limit?: number): Promise<ChatMessage[]>;
}
