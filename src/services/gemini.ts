import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../helpers/constants";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type Palette = {
  value: number;
  name: string;
  color: string;
};

export const generatePalette = async (value: string) => {
  const prompt = `Quiero que me generes una paleta de colores para una empresa que está descrita de la siguiente forma: ${value} intenta coger esa descripción y generar una paleta de colores para ella. Quiero que lo que me devuelvas sea un array de objetos con las claves "value", que vaya del 100 al 900, name para el nombre de ese color específico, no dentro de la paleta sino como se llama ese color de forma oficial como por ejemplo mediterranean sea, pale flower o jewel weed, pero que no tenga el nombre de la paleta ni empresa, solo del color y "color" con el hexadecimal correspondiente. Si no puedes coger la descripción, responde con null. Responde unicamente con el JSON. Si no tienes información suficiente para generar una paleta de colores, respondeme con una paleta accesible y sencilla de colores. Tiene que tener 9 colores en total. Tiene que ser monocromatica. De claros a oscuros. A la hora de generar la paleta, genera un tono 500 en base a la descripción de la empresa. y en base a ese 500 haz del 100 al 900 más claros u oscuros de forma correspondiente. No te olvides de poner el JSON con la paleta de colores y no te olvides de poner el JSON con null si no puedes coger la descripción. Solo responde con JSON. que no empiece por triples comillas ni json ni acabe por comillas, pon el json plano. Recuerda que la paleta de colores tiene que ir en sintonía con la descripción de la empresa, sigue las líneas cromáticas por ej. qué tonos de colores se usan en empresas bancarias, o en startups o en productos concretos. los colores son afines a la personalidad y al caracter de la empresa.`;
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            value: {
              type: "integer",
            },
            name: {
              type: "string",
            },
            color: {
              type: "string",
            },
          },
        },
      },
    },
  });

  if (!response.text) {
    return null;
  }

  return JSON.parse(response.text) as Palette[];
};
