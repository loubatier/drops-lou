export type Category = "note" | "photo" | "tip" | "riddle";
export type Sort = "recent" | "popular";

export type Drop = {
  id: number;
  title: string;
  content: string | null;
  category: Category;
  imageUrl: string | null;
  location: { lat: number; lng: number; precision: "exact" | "approx" };
  locked: boolean;
  hidden: boolean;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  likesCount: number;
  commentsCount: number;
  opensCount: number;
  likedByMe: boolean;
  openedByMe: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DropPage = {
  items: Drop[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type DropsQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: Category;
  author?: string;
  sort?: Sort;
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "note", label: "Note" },
  { id: "photo", label: "Photo" },
  { id: "tip", label: "Astuce" },
  { id: "riddle", label: "Énigme" },
];

const API_URL =
  process.env.DROPS_API_URL ?? "https://drops-api-production.up.railway.app";

export async function fetchDrops(query: DropsQuery): Promise<DropPage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const res = await fetch(`${API_URL}/drops?${params}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Erreur API (${res.status})`);
  }
  return res.json();
}
