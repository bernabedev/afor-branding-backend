import type { GeneratedPalette } from "./generated-palette.entity";

export interface FavoritePalette {
  id: string;
  userId: string;
  paletteId: string;
  name?: string | null;
  createdAt: Date;
  palette?: GeneratedPalette;
}

export type FavoritePaletteCreationData = Omit<
  FavoritePalette,
  "id" | "createdAt" | "palette"
>;
