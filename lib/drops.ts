import { api, ApiError } from "@/lib/api/client";
import { authHeaders } from "@/lib/auth/session";
import type { Category } from "@/lib/drop-categories";

export { CATEGORIES, type Category } from "@/lib/drop-categories";

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

export async function fetchDrops(query: DropsQuery): Promise<DropPage> {
  return api.get<DropPage>("/drops", { query, headers: await authHeaders() });
}

export async function fetchDrop(id: string): Promise<Drop | null> {
  try {
    return await api.get<Drop>(`/drops/${encodeURIComponent(id)}`, {
      headers: await authHeaders(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
