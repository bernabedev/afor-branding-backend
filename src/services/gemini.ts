import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../helpers/constants";

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
  `;
};

export const generatePalette = async (value: string) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: getPrompt(value) }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            value: {
              type: "integer",
              description: "Value of the color",
            },
            name: {
              type: "string",
              description: "Name of the color",
            },
            color: {
              type: "string",
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
