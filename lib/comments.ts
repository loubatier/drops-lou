import { api } from "@/lib/api/client";
import { authHeaders } from "@/lib/auth/session";
import { COMMENTS_PAGE_SIZE } from "@/lib/comment-limits";
import type { Drop } from "@/lib/drops";

export type Comment = {
  id: number;
  dropId: number;
  content: string;
  author: Drop["author"];
  isMine: boolean;
  createdAt: string;
};

export type CommentPage = {
  items: Comment[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function fetchComments(
  dropId: number,
  page: number,
): Promise<CommentPage> {
  return api.get<CommentPage>(`/drops/${dropId}/comments`, {
    query: { page, pageSize: COMMENTS_PAGE_SIZE },
    headers: await authHeaders(),
  });
}
