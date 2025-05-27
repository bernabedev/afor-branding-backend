export enum MessageRoleDomain {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
}

export enum MessageReactionDomain {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRoleDomain;
  content: string;
  reaction?: MessageReactionDomain | null;
  createdAt: Date;
}

export type ChatMessageCreationData = Omit<ChatMessage, "id" | "createdAt">;
