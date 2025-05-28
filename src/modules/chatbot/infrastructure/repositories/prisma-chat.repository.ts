import type {
  Chat as PrismaChat,
  ChatMessage as PrismaChatMessage,
  PrismaClient,
} from "@/generated/prisma";
import type { IChatRepository } from "../../application/ports/chat.repository";
import type {
  ChatMessage,
  MessageReactionDomain,
  MessageRoleDomain,
} from "../../domain/chat-message.entity";
import type { Chat, ChatCreationData } from "../../domain/chat.entity";

export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapPrismaMessageToDomain(prismaMsg: PrismaChatMessage): ChatMessage {
    return {
      id: prismaMsg.id,
      chatId: prismaMsg.chatId,
      role: prismaMsg.role as MessageRoleDomain,
      content: prismaMsg.content,
      reaction: prismaMsg.reaction as MessageReactionDomain | null | undefined,
      createdAt: prismaMsg.createdAt,
    };
  }

  private mapPrismaChatToDomain(
    prismaChat: PrismaChat & { messages?: PrismaChatMessage[] }
  ): Chat {
    return {
      id: prismaChat.id,
      userId: prismaChat.userId,
      messages:
        prismaChat.messages?.map((msg) => this.mapPrismaMessageToDomain(msg)) ||
        [],
      createdAt: prismaChat.createdAt,
    };
  }

  async findById(chatId: string): Promise<Chat | null> {
    const prismaChat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } }, // Limitar mensajes incluidos
    });
    return prismaChat ? this.mapPrismaChatToDomain(prismaChat) : null;
  }

  async create(data: ChatCreationData): Promise<Chat> {
    const prismaChat = await this.prisma.chat.create({
      data: {
        userId: data.userId, // Puede ser null para chats anónimos
      },
    });
    return this.mapPrismaChatToDomain(prismaChat);
  }

  async getHistory(chatId: string, limit: number = 20): Promise<ChatMessage[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return messages.reverse().map((msg) => this.mapPrismaMessageToDomain(msg));
  }
}
