"use server";

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
