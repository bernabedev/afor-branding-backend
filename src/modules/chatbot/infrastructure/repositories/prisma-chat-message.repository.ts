import type {
  MessageRole,
  ChatMessage as PrismaChatMessage,
  PrismaClient,
} from "@/generated/prisma";
import type { IChatMessageRepository } from "../../application/ports/chat-message.repository";
import type {
  ChatMessage,
  ChatMessageCreationData,
  MessageReactionDomain,
  MessageRoleDomain,
} from "../../domain/chat-message.entity";

export class PrismaChatMessageRepository implements IChatMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(prismaMsg: PrismaChatMessage): ChatMessage {
    return {
      id: prismaMsg.id,
      chatId: prismaMsg.chatId,
      role: prismaMsg.role as MessageRoleDomain,
      content: prismaMsg.content,
      reaction: prismaMsg.reaction as MessageReactionDomain | null | undefined,
      createdAt: prismaMsg.createdAt,
    };
  }

  async create(data: ChatMessageCreationData): Promise<ChatMessage> {
    const prismaMsg = await this.prisma.chatMessage.create({
      data: {
        chatId: data.chatId,
        role: data.role as MessageRole,
        content: data.content,
      },
    });
    return this.mapToDomain(prismaMsg);
  }
}
