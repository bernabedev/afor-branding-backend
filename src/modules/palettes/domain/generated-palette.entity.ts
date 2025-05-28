import type { PaletteColor } from "@/modules/chatbot/domain/palette.entity";

export interface GeneratedPalette {
  id: string;
  userId?: string | null;
  name?: string | null;
  colors: PaletteColor[];
  createdAt: Date;
}

export type GeneratedPaletteCreationData = Omit<
  GeneratedPalette,
  "id" | "createdAt"
>;
