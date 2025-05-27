import type { Font } from "./font.entity";
import type { Palette } from "./palette.entity";

export type GeminiFunctionCallResponse = Font[] | Palette;
export type GeminiChatResponse = string | GeminiFunctionCallResponse;
