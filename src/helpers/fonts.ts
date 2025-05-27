export type FontType = "heading" | "body";
export type Font = {
  name: string;
  key: string;
  type: FontType;
};

export const FONTS: Font[] = [
  {
    name: "Inter",
    key: "inter",
    type: "heading",
  },
  {
    name: "Poppins",
    key: "poppins",
    type: "body",
  },
  {
    name: "Roboto",
    key: "roboto",
    type: "body",
  },
  {
    name: "Lato",
    key: "lato",
    type: "body",
  },
];
