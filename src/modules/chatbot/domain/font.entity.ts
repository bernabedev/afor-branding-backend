export type FontType = "heading" | "body";

export interface Font {
  name: string;
  key: string;
  type: FontType;
}

export interface FontList extends Omit<Font, "type"> {
  availableFor: FontType[];
}
