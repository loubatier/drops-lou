"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api/client";
import { authHeaders } from "@/lib/auth/session";

export type LikeState = { liked: boolean; likesCount: number };

export type LikeResult =
  | { ok: true; state: LikeState }
  | { ok: false; unauthorized: boolean; message: string };

export async function setLike(dropId: number, liked: boolean): Promise<LikeResult> {
  try {
    const path = `/drops/${dropId}/like`;
    const headers = await authHeaders();
    const state = liked
      ? await api.post<LikeState>(path, { headers })
      : await api.delete<LikeState>(path, { headers });
    return { ok: true, state };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        unauthorized: error.status === 401,
        message: error.message,
      };
    }
    return { ok: false, unauthorized: false, message: "Une erreur est survenue. Réessaie." };
  }
}

export type DropFormState = {
  message?: string;
  fields?: Record<string, string[]>;
  savedId?: number;
};

const CATEGORY_IDS = ["note", "photo", "tip", "riddle"] as const;

export async function saveDrop(
  _state: DropFormState,
  formData: FormData,
): Promise<DropFormState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const dropId = text("dropId");
  const title = text("title");
  const content = text("content");
  const category = CATEGORY_IDS.find((id) => id === text("category"));
  const imageUrl = text("imageUrl");
  const lat = Number.parseFloat(text("lat"));
  const lng = Number.parseFloat(text("lng"));

  const fields: Record<string, string[]> = {};
  if (!title) fields.title = ["Le titre est obligatoire."];
  if (!content) fields.content = ["Le contenu est obligatoire."];
  if (!category) fields.category = ["Choisis une catégorie."];
  if (category === "photo" && !imageUrl) {
    fields.imageUrl = ["Une photo exige l'URL d'une image."];
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    fields.location = ["Choisis un point sur la carte."];
  }
  if (Object.keys(fields).length > 0) return { fields };

  const body = {
    title,
    content,
    category,
    imageUrl: category === "photo" ? imageUrl : null,
    lat,
    lng,
  };

  try {
    const headers = await authHeaders();
    const drop = dropId
      ? await api.patch<{ id: number }>(`/drops/${encodeURIComponent(dropId)}`, {
          body,
          headers,
        })
      : await api.post<{ id: number }>("/drops", { body, headers });
    revalidatePath("/drops");
    revalidatePath(`/drops/${drop.id}`);
    return { savedId: drop.id };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { message: "Connecte-toi pour continuer." };
      }
      return { message: error.message, fields: error.fields };
    }
    return { message: "Une erreur est survenue. Réessaie." };
  }
}
