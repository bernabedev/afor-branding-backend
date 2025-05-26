import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../helpers/constants";
import { PROMPTS } from "../helpers/prompts";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type Palette = {
  value: number;
  name: string;
  color: string;
};

// FORMAT THE PROMPT
const getPrompt = (value: string) => {
  return `
    Generate a monochromatic color palette of nine shades for a company based on its description:

    ${value}

    Requirements:
    1. Analyze the description above to determine the base tone (shade 500).
    2. Build a 9-step monochromatic scale from 100 (lightest) through 900 (darkest), relative to that base.
    3. Output a plain JSON array of nine objects—do not wrap the JSON in quotes, backticks, or any extra text.
    4. Each object must include:
      • "value": the shade number (100, 200, …, 900)  
      • "name": the official color name (e.g., "Mediterranean Sea", "Pale Flower", "Jewel Weed") — do not include the company or palette name  
      • "color": the hexadecimal code (e.g., "#3A7BD5")
    5. If the description is insufficient to generate an on-brand palette, generate a random but accessible monochromatic palette of nine shades following the same format.

    Important:
    - The response must be a valid JSON array of objects.
    - Do not include any additional text or formatting.
    - Do not wrap the JSON in quotes, backticks, or any extra text.
  `;
};

export const generatePalette = async (value: string) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: getPrompt(value) }] }],
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
          ],
        },
      ],
    },
  });

  if (response.functionCalls?.length) {
    if (response.functionCalls[0].name === "generatePalette") {
      const args = response.functionCalls[0].args as Record<string, unknown>;
      console.log({ args });
      const palette = await generatePalette(args.description as string);
      localHistory.set(id, [
        ...history,
        { role: "assistant", parts: [{ text: JSON.stringify(palette) }] },
      ]);
      return palette;
    }
  }

  if (!response.text) {
    return null;
  }

  return response.text;
};
