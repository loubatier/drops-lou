"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api/client";
import { authHeaders } from "@/lib/auth/session";
import { COMMENT_MAX_LENGTH } from "@/lib/comment-limits";

export type CommentFormState = {
  message?: string;
  content?: string;
  posted?: number;
};

export async function addComment(
  state: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const dropId = String(formData.get("dropId") ?? "");
  const raw = formData.get("content");
  const content = typeof raw === "string" ? raw.trim() : "";

  if (!content) {
    return { message: "Écris un commentaire avant de publier.", content };
  }
  if (content.length > COMMENT_MAX_LENGTH) {
    return {
      message: `Un commentaire ne peut pas dépasser ${COMMENT_MAX_LENGTH} caractères.`,
      content,
    };
  }

  try {
    await api.post(`/drops/${encodeURIComponent(dropId)}/comments`, {
      body: { content },
      headers: await authHeaders(),
    });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.status === 401
          ? "Connecte-toi pour commenter."
          : (error.fields.content?.join(" ") ?? error.message)
        : "Une erreur est survenue. Réessaie.";
    return { message, content };
  }

  revalidatePath(`/drops/${dropId}`);
  return { posted: (state.posted ?? 0) + 1 };
}

export async function deleteComment(formData: FormData) {
  const dropId = String(formData.get("dropId") ?? "");
  const commentId = String(formData.get("commentId") ?? "");

  await api.delete(`/comments/${encodeURIComponent(commentId)}`, {
    headers: await authHeaders(),
  });

  revalidatePath(`/drops/${dropId}`);
}
