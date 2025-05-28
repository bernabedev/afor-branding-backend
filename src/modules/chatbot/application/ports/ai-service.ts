import type { GeminiChatResponse } from "../../domain/gemini-response.type";

export interface ChatTurn {
  role: "user" | "model"; // 'model' es usado por Gemini para respuestas del asistente
  parts: { text: string }[];
}

export interface IAiService {
  generateChatContent(
    history: ChatTurn[],
    newMessage: string
  ): Promise<GeminiChatResponse | null>;
}
