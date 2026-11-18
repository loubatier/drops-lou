"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api/client";
import type { FormState } from "@/lib/auth/actions";
import { authHeaders } from "@/lib/auth/session";
import {
  CATEGORIES,
  COMMENT_MAX_LENGTH,
  type Comment,
  type Category,
  type Drop,
  type DropInput,
  type LikeState,
} from "@/lib/drops";

export type DeleteState = { message?: string };

export type LikeResult =
  | { ok: true; state: LikeState }
  | { ok: false; message: string };

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const coordinate = (raw: string, limit: number) => {
  if (!raw) return null;
  const value = Number(raw.replace(",", "."));
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
};

function parseDrop(
  formData: FormData,
):
  | { ok: true; input: DropInput }
  | { ok: false; state: FormState } {
  const values = {
    title: text(formData, "title"),
    content: text(formData, "content"),
    category: text(formData, "category"),
    imageUrl: text(formData, "imageUrl"),
    lat: text(formData, "lat"),
    lng: text(formData, "lng"),
  };
  const fields: Record<string, string[]> = {};

  if (!values.title) fields.title = ["Le titre est requis."];
  if (!values.content) fields.content = ["Le contenu est requis."];
  if (!CATEGORIES.some((c) => c.id === values.category)) {
    fields.category = ["Choisis une catégorie."];
  }
  if (values.category === "photo" && !values.imageUrl) {
    fields.imageUrl = ["Une photo nécessite une URL d'image."];
  }
  if (values.imageUrl && !/^https?:\/\//i.test(values.imageUrl)) {
    fields.imageUrl = ["L'URL doit commencer par http:// ou https://."];
  }

  const lat = coordinate(values.lat, 90);
  const lng = coordinate(values.lng, 180);
  if (lat === null || lng === null) {
    fields.location = [
      "Renseigne une latitude (-90 à 90) et une longitude (-180 à 180) valides.",
    ];
  }

  if (Object.keys(fields).length > 0 || lat === null || lng === null) {
    return {
      ok: false,
      state: {
        message: "Corrige les champs signalés.",
        fields,
        values,
      },
    };
  }

  return {
    ok: true,
    input: {
      title: values.title,
      content: values.content,
      category: values.category as Category,
      imageUrl: values.imageUrl || null,
      lat,
      lng,
    },
  };
}

function describe(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Impossible de joindre le serveur. Vérifie ta connexion et réessaie.";
  }
  switch (error.status) {
    case 403:
      return "Tu ne peux modifier que tes propres drops.";
    case 429:
      return error.retryAfter
        ? `Trop de requêtes. Réessaie dans ${error.retryAfter} s.`
        : "Trop de requêtes. Réessaie dans un instant.";
    default:
      return error.status >= 500
        ? "Le service rencontre un problème. Réessaie dans un instant."
        : error.message;
  }
}

function redirectOnSessionOrMissing(error: unknown) {
  if (!(error instanceof ApiError)) return;
  if (error.status === 401) redirect("/");
  if (error.status === 404) redirect("/drops");
}

function failure(error: unknown, values: FormState["values"]): FormState {
  redirectOnSessionOrMissing(error);
  return {
    message: describe(error),
    fields: error instanceof ApiError ? error.fields : undefined,
    values,
  };
}

function valuesOf(input: DropInput): FormState["values"] {
  return {
    title: input.title,
    content: input.content,
    category: input.category,
    imageUrl: input.imageUrl ?? "",
    lat: String(input.lat),
    lng: String(input.lng),
  };
}

export async function createDrop(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseDrop(formData);
  if (!parsed.ok) return parsed.state;

  let drop: Drop;
  try {
    drop = await api.post<Drop>("/drops", {
      body: parsed.input,
      headers: await authHeaders(),
    });
  } catch (error) {
    return failure(error, valuesOf(parsed.input));
  }

  revalidatePath("/drops");
  redirect(`/drops/${drop.id}`);
}

export async function updateDrop(
  id: number,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseDrop(formData);
  if (!parsed.ok) return parsed.state;

  try {
    await api.patch<Drop>(`/drops/${id}`, {
      body: parsed.input,
      headers: await authHeaders(),
    });
  } catch (error) {
    return failure(error, valuesOf(parsed.input));
  }

  revalidatePath("/drops");
  redirect(`/drops/${id}`);
}

export async function deleteDrop(id: number): Promise<DeleteState> {
  try {
    await api.delete(`/drops/${id}`, { headers: await authHeaders() });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) {
      if (error instanceof ApiError && error.status === 401) redirect("/");
      return { message: describe(error) };
    }
  }

  revalidatePath("/drops");
  redirect("/drops");
}

export async function setLike(id: number, liked: boolean): Promise<LikeResult> {
  try {
    const state = liked
      ? await api.post<LikeState>(`/drops/${id}/like`, {
          headers: await authHeaders(),
        })
      : await api.delete<LikeState>(`/drops/${id}/like`, {
          headers: await authHeaders(),
        });
    return { ok: true, state };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/");
    if (error instanceof ApiError && error.status === 404) {
      return { ok: false, message: "Ce drop n'existe plus." };
    }
    return { ok: false, message: describe(error) };
  }
}

export async function addComment(
  dropId: number,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const content = text(formData, "content");
  if (!content) {
    return { message: "Écris un commentaire.", values: { content } };
  }
  if (content.length > COMMENT_MAX_LENGTH) {
    return {
      message: `Un commentaire ne dépasse pas ${COMMENT_MAX_LENGTH} caractères.`,
      values: { content },
    };
  }

  try {
    await api.post<Comment>(`/drops/${dropId}/comments`, {
      body: { content },
      headers: await authHeaders(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/");
    if (error instanceof ApiError && error.status === 404) redirect("/drops");
    return {
      message: describe(error),
      fields: error instanceof ApiError ? error.fields : undefined,
      values: { content },
    };
  }

  revalidatePath(`/drops/${dropId}`);
  return { values: { content: "" } };
}

export async function deleteComment(
  dropId: number,
  commentId: number,
): Promise<DeleteState> {
  try {
    await api.delete(`/comments/${commentId}`, { headers: await authHeaders() });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) {
      if (error instanceof ApiError && error.status === 401) redirect("/");
      return { message: describe(error) };
    }
  }

  revalidatePath(`/drops/${dropId}`);
  return {};
}
