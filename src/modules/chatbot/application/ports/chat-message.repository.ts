import { PaginatedResult, PaginateOptions } from "@/helpers/paginate";
import type {
  ChatMessage,
  ChatMessageCreationData,
  MessageReactionDomain,
} from "../../domain/chat-message.entity";

export interface IChatMessageRepository {
  create(data: ChatMessageCreationData): Promise<ChatMessage>;
  findById(id: string): Promise<ChatMessage | null>;
  updateReaction(
    id: string,
    reaction: MessageReactionDomain | null
  ): Promise<ChatMessage>;
  findByChatId(
    chatId: string,
    options: PaginateOptions
  ): Promise<PaginatedResult<ChatMessage>>;
}
