import type { GeminiChatResponse } from "../../domain/gemini-response.type";

export interface ChatTurn {
  role: "user" | "assistant" | "model";
  parts: { text: string }[];
}

export interface IAiService {
  generateInitialAssistantPrompt(): string;
  generateChatContent(
    history: ChatTurn[],
    newMessage: string
  ): Promise<GeminiChatResponse | null>;
  generatePalette(description: string): Promise<GeminiChatResponse | null>;
  generateFonts(description: string): Promise<GeminiChatResponse | null>;
}
