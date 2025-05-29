export interface PaletteColor {
  value: number;
  name: string;
  color: string; // Hex
}

export interface Palette {
  name: string;
  description: string;
  colors: PaletteColor[];
}
