export type Category = "note" | "photo" | "tip" | "riddle";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "note", label: "Note" },
  { id: "photo", label: "Photo" },
  { id: "tip", label: "Astuce" },
  { id: "riddle", label: "Énigme" },
];
