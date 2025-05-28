import type { ChatMessage } from "./chat-message.entity";

export interface Chat {
  id: string;
  userId?: string | null;
  messages: ChatMessage[];
  createdAt: Date;
}

export type ChatCreationData = Pick<Chat, "userId">;
