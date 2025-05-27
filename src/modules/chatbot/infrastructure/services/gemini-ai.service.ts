import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Type,
  type Content,
  type GenerateContentResponse,
  type Part,
  type Tool,
} from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../../../../helpers/constants";
import { PROMPTS } from "../../../../helpers/prompts";
import type { ChatTurn, IAiService } from "../../application/ports/ai-service";
import type { Font } from "../../domain/font.entity";
import type {
  GeminiChatResponse,
  GeminiFunctionCallResponse,
} from "../../domain/gemini-response.type";
import type { Palette } from "../../domain/palette.entity";

const anonymousChatHistories: Map<string, Content[]> = new Map();

export class GeminiAiService implements IAiService {
  private ai: GoogleGenAI;
  private modelName: string;

  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    this.modelName = GEMINI_MODEL;
  }

  generateInitialAssistantPrompt(): string {
    return PROMPTS.assistant;
  }

  private async _generateSimpleContent(
    prompt: string,
    responseMimeType: "application/json" | "text/plain" = "application/json"
  ): Promise<string | null> {
    try {
      const request = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: responseMimeType,
        },
      };

      const result: GenerateContentResponse =
        await this.ai.models.generateContent({
          model: this.modelName,
          ...request,
        });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error(
          `Gemini: No text in response for prompt: ${prompt.substring(
            0,
            50
          )}...`
        );
        if (result.promptFeedback?.blockReason) {
          console.error(
            `Gemini: Prompt blocked. Reason: ${result.promptFeedback.blockReason}`
          );
        }
        result.candidates?.forEach((candidate, index) => {
          console.error(
            `Gemini: Candidate ${index} finish reason: ${candidate.finishReason}`
          );
          candidate.safetyRatings?.forEach((sr) => {
            console.error(
              `Gemini: Candidate ${index} safety rating: ${sr.category} - ${sr.probability}`
            );
          });
        });
        return null;
      }
      return text;
    } catch (error) {
      console.error("Gemini: Error in _generateSimpleContent:", error);
      return null;
    }
  }

  private async _generatePaletteFromAI(
    description: string
  ): Promise<Palette | null> {
    const jsonText = await this._generateSimpleContent(
      PROMPTS.generatePalette(description),
      "application/json"
    );
    if (!jsonText) return null;
    try {
      return JSON.parse(jsonText) as Palette;
    } catch (e) {
      console.error("Gemini: Failed to parse palette JSON:", jsonText, e);
      return null;
    }
  }

  private async _generateFontsFromAI(
    description: string
  ): Promise<Font[] | null> {
    const jsonText = await this._generateSimpleContent(
      PROMPTS.generateFonts(description),
      "application/json"
    );
    if (!jsonText) return null;
    try {
      return JSON.parse(jsonText) as Font[];
    } catch (e) {
      console.error("Gemini: Failed to parse font JSON:", jsonText, e);
      return null;
    }
  }

  async generatePalette(
    description: string
  ): Promise<GeminiChatResponse | null> {
    return this._generatePaletteFromAI(description);
  }

  async generateFonts(description: string): Promise<GeminiChatResponse | null> {
    return this._generateFontsFromAI(description);
  }

  async generateChatContent(
    dbHistory: ChatTurn[],
    newMessage: string,
    chatIdForAnonymous?: string
  ): Promise<GeminiChatResponse | null> {
    const tools: Tool[] = [
      {
        functionDeclarations: [
          {
            name: "generatePalette",
            description:
              "Generate a palette of colors based on a company description",
            parameters: {
              type: Type.OBJECT,
              properties: {
                description: {
                  type: Type.STRING,
                  description: "Company description",
                },
              },
              required: ["description"],
            },
          },
          {
            name: "generateFonts",
            description:
              "Generate two complementary typefaces (heading and body) based on a company description",
            parameters: {
              type: Type.OBJECT,
              properties: {
                description: {
                  type: Type.STRING,
                  description: "Company description",
                },
              },
              required: ["description"],
            },
          },
        ],
      },
    ];

    let conversationHistory: Content[] = [];

    if (chatIdForAnonymous) {
      conversationHistory =
        anonymousChatHistories.get(chatIdForAnonymous) || [];
    } else {
      conversationHistory = dbHistory.map((turn) => ({
        role: turn.role === "user" ? "user" : "model",
        parts: turn.parts.map((part) => ({ text: part.text })),
      }));
    }

    const systemInstructionContent: Content = {
      role: "system",
      parts: [{ text: this.generateInitialAssistantPrompt() }],
    };

    const currentConversationContents: Content[] = [
      ...conversationHistory,
      { role: "user", parts: [{ text: newMessage }] },
    ];

    if (chatIdForAnonymous) {
      anonymousChatHistories.set(chatIdForAnonymous, [
        ...currentConversationContents,
      ]);
    }

    const request = {
      contents: currentConversationContents,
      tools: tools,
      systemInstruction: systemInstructionContent,

      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    };

    try {
      const result: GenerateContentResponse =
        await this.ai.models.generateContent({
          model: this.modelName,
          ...request,
        });

      const candidate = result.candidates?.[0];
      if (!candidate) {
        console.error("Gemini Chat: No candidate in response.");
        if (result.promptFeedback?.blockReason) {
          console.error(
            `Gemini Chat: Prompt blocked. Reason: ${result.promptFeedback.blockReason}`
          );
        }
        return null;
      }

      const functionCallPart = candidate.content?.parts?.find(
        (part) => part.functionCall
      );
      if (functionCallPart && functionCallPart.functionCall) {
        const { name, args } = functionCallPart.functionCall;
        console.log(`Gemini Chat: Function call requested: ${name}`, args);
        let functionCallResultData: GeminiFunctionCallResponse | null = null;

        if (name === "generatePalette") {
          functionCallResultData = await this._generatePaletteFromAI(
            args?.description as string
          );
        } else if (name === "generateFonts") {
          functionCallResultData = await this._generateFontsFromAI(
            args?.description as string
          );
        }

        const functionResponsePartContent: Part = {
          functionResponse: {
            name,
            response: {
              name,
              content: functionCallResultData || {
                error: "Function execution failed or no data",
              },
            },
          },
        };

        if (chatIdForAnonymous) {
          const currentAnonHist =
            anonymousChatHistories.get(chatIdForAnonymous) || [];
          anonymousChatHistories.set(chatIdForAnonymous, [
            ...currentAnonHist,
            { role: "model", parts: [functionCallPart] },
            { role: "function", parts: [functionResponsePartContent] },
          ]);
        }

        return functionCallResultData;
      }

      const textResponse = candidate.content?.parts
        ?.map((part) => part.text)
        .join("")
        .trim();
      if (textResponse) {
        if (chatIdForAnonymous) {
          const currentAnonHist =
            anonymousChatHistories.get(chatIdForAnonymous) || [];
          anonymousChatHistories.set(chatIdForAnonymous, [
            ...currentAnonHist,
            { role: "model", parts: [{ text: textResponse }] },
          ]);
        }
        return textResponse;
      }

      console.warn(
        "Gemini Chat: No text or function call in final response part."
      );
      return null;
    } catch (error) {
      console.error("Gemini: Error in generateChatContent:", error);
      return null;
    }
  }
}
