import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api/client";
import { authHeaders } from "@/lib/auth/session";

export * from "@/lib/drop-model";
import {
  COMMENTS_PAGE_SIZE,
  type CommentPage,
  type Drop,
  type DropPage,
  type DropsQuery,
} from "@/lib/drop-model";

export async function fetchDrops(query: DropsQuery): Promise<DropPage> {
  try {
    return await api.get<DropPage>("/drops", {
      query,
      headers: await authHeaders(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/");
    throw error;
  }
}

export async function fetchDrop(id: string): Promise<Drop | null> {
  try {
    return await api.get<Drop>(`/drops/${encodeURIComponent(id)}`, {
      headers: await authHeaders(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/");
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchComments(
  dropId: string,
  page: number,
): Promise<CommentPage | null> {
  try {
    return await api.get<CommentPage>(
      `/drops/${encodeURIComponent(dropId)}/comments`,
      {
        query: { page, pageSize: COMMENTS_PAGE_SIZE },
        headers: await authHeaders(),
      },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/");
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
