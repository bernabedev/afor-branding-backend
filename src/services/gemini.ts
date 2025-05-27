import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../helpers/constants";
import { Font } from "../helpers/fonts";
import { PROMPTS } from "../helpers/prompts";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type Palette = {
  value: number;
  name: string;
  color: string;
};

export const generatePalette = async (value: string) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: PROMPTS.generatePalette(value),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            value: {
              type: Type.INTEGER,
              description: "Value of the color",
            },
            name: {
              type: Type.STRING,
              description: "Name of the color",
            },
            color: {
              type: Type.STRING,
              description: "Color in hex format",
            },
          },
          required: ["value", "name", "color"],
        },
      },
    },
  });

  if (!response.text) {
    return null;
  }

  return JSON.parse(response.text) as Palette[];
};

export const generateFonts = async (value: string) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: PROMPTS.generateFonts(value),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The font family name",
            },
            key: {
              type: Type.STRING,
              description: "Unique key identifier",
            },
            type: {
              type: Type.STRING,
              description: "Either 'heading' or 'body'",
            },
          },
          required: ["name", "key", "type"],
        },
      },
    },
  });

  if (!response.text) {
    return null;
  }

  return JSON.parse(response.text) as Font[];
};

const localHistory: Map<string, { role: string; parts: { text: string }[] }[]> =
  new Map();

export const generateContentChatBot = async (id: string, value: string) => {
  const history = localHistory.get(id) || [];
  localHistory.set(id, [
    ...history,
    { role: "user", parts: [{ text: value }] },
  ]);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "assistant",
        parts: [{ text: PROMPTS.assistant }],
      },
      ...history.map((item) => ({
        role: item.role,
        parts: item.parts,
      })),
      {
        role: "user",
        parts: [{ text: value }],
      },
    ],
    config: {
      tools: [
        {
          functionDeclarations: [
            {
              name: "generatePalette",
              description: "Generate a palette of colors",
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
              description: "Generate fonts",
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
      ],
    },
  });

  if (response.functionCalls?.length) {
    if (response.functionCalls[0].name === "generatePalette") {
      const args = response.functionCalls[0].args as Record<string, unknown>;
      const palette = await generatePalette(args.description as string);
      localHistory.set(id, [
        ...history,
        { role: "assistant", parts: [{ text: JSON.stringify(palette) }] },
      ]);
      return palette;
    }
    if (response.functionCalls[0].name === "generateFonts") {
      const args = response.functionCalls[0].args as Record<string, unknown>;
      const fonts = await generateFonts(args.description as string);
      localHistory.set(id, [
        ...history,
        { role: "assistant", parts: [{ text: JSON.stringify(fonts) }] },
      ]);
      return fonts;
    }
  }

  if (!response.text) {
    return null;
  }

  return response.text;
};
