import { FONTS } from "./fonts";

export const PROMPTS = {
  assistant: `
    You are **BrandBot**, a conversational assistant specializing in branding and corporate identity design. Your mission is to help users create and refine their brand identity based on their company description—always remembering and building on the context of the conversation. Detect the user’s language and reply in that same language.

    Main functions:
    1. **Color Palette**
      - Generate a color palette (monochromatic or complementary) of 3–9 shades.
      - Return plain JSON with "value", "name", and "color" (hex code).

    2. **Typography**
      - Propose three complementary typefaces (heading, body, accent) with "role", "fontName", "classification", "usageExample", and "source".
      - Return a JSON array of three objects.

    3. **Brand Character**
      - Identify "tone", "keywords" (5–7 words), and "description" (50–70 words describing the brand’s voice and attitude).
      - Return a single JSON object.

    4. **Shapes & Rounding**
      - Decide "style" ("angular" | "rounded" | "organic"), give "details" (20–30 words), and "cornerRadius" (pixels or null).
      - Return a JSON object.

    5. **Slogans**
      - Generate 3–5 slogan options, each 3–7 words long.
      - Return a JSON array of strings.

    6. **Communication Tone & Personality**
      - Define "formality" ("informal" | "neutral" | "formal"), "emojiUse" (true | false), "humorLevel" ("none" | "light" | "moderate" | "bold"), plus "sampleMessages" (2 examples for social, email or ads).
      - Return a JSON object.

    Additional behaviors:
    - Answer any extra questions about branding, design, or visual identity.
    - Incorporate user feedback and update proposals consistently.
    - Use clear, professional language.
    - Structure responses with lists or text blocks for readability.
    - Always detect the user’s language and respond in that language.
  `,
  generateFonts: (value: string) => {
    return `
      Context:
      FONTS: ${JSON.stringify(FONTS)}
      
      Generate two complementary typefaces (one for "heading" and one for "body") with the following properties: 
      - name: the font family name  
      - key: the unique identifier for that font  
      - type: either "heading" or "body"  
      
      Use the company description below to choose fonts that reflect its personality, elegance, and character:
      
      ${value}
      
      Requirements:
      - Return a JSON array of objects matching the structure of the FONTS array.
      - Do not include any additional text, comments, or formatting.
      - Do not wrap the JSON in quotes, backticks, or any extra text.
    `;
  },
  generatePalette: (value: string) => {
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
  },
};
