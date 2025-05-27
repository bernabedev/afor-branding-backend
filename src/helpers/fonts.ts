export type FontType = "heading" | "body";
export type Font = {
  name: string;
  key: string;
  type: FontType;
};

export type FontList = Omit<Font, "type"> & {
  availableFor: FontType[];
};

export const FONTS: FontList[] = [
  { name: "Inter", key: "inter", availableFor: ["heading", "body"] },
  { name: "Poppins", key: "poppins", availableFor: ["heading"] },
  { name: "DMSans", key: "dm-sans", availableFor: ["heading"] },
  { name: "Geist", key: "geist", availableFor: ["heading", "body"] },
  { name: "Montserrat", key: "montserrat", availableFor: ["heading"] },
  { name: "CalSans", key: "cal-sans", availableFor: ["body"] },
  { name: "Lato", key: "lato", availableFor: ["body"] },
  { name: "Figtree", key: "figtree", availableFor: ["body"] },
] as const;
