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
  async findById(id: string): Promise<ChatMessage | null> {
    const prismaMsg = await this.prisma.chatMessage.findUnique({
      where: { id },
    });
    return prismaMsg ? this.mapToDomain(prismaMsg) : null;
  }

  async updateReaction(
    id: string,
    reaction: MessageReactionDomain | null
  ): Promise<ChatMessage> {
    const prismaMsg = await this.prisma.chatMessage.update({
      where: { id },
      data: { reaction },
    });
    return this.mapToDomain(prismaMsg);
  }

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
        role: data.role as MessageRole, // Prisma enum
        content: data.content,
      },
    });
    return this.mapToDomain(prismaMsg);
  }
}
