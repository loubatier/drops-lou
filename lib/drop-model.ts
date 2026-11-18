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

export type LikeState = {
  liked: boolean;
  likesCount: number;
};

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

export const COMMENT_MAX_LENGTH = 500;
export const COMMENTS_PAGE_SIZE = 20;

export type DropInput = {
  title: string;
  content: string;
  category: Category;
  imageUrl: string | null;
  lat: number;
  lng: number;
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
