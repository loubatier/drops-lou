import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { fetchComments, type Comment } from "@/lib/comments";
import { CommentForm } from "./comment-form";
import { DeleteCommentButton } from "./delete-comment-button";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

function gradientFor(id: number) {
  const hue = (id * 67) % 360;
  return `linear-gradient(135deg, oklch(0.72 0.17 ${hue}), oklch(0.58 0.2 ${(hue + 50) % 360}))`;
}

export async function Comments({
  dropId,
  page,
}: {
  dropId: number;
  page: number;
}) {
  const [user, comments] = await Promise.all([
    getCurrentUser(),
    fetchComments(dropId, page),
  ]);
  const href = (target: number) =>
    target > 1 ? `/drops/${dropId}?page=${target}` : `/drops/${dropId}`;

  return (
    <section aria-labelledby="comments-title" className="mt-10">
      <h2 id="comments-title" className="text-lg font-semibold tracking-tight">
        Commentaires{" "}
        <span className="font-normal text-muted-foreground">
          ({comments.total})
        </span>
      </h2>

      <div className="mt-4">
        {user ? (
          <CommentForm dropId={dropId} />
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Connecte-toi
            </Link>{" "}
            pour laisser un commentaire.
          </p>
        )}
      </div>

      {comments.items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Aucun commentaire pour le moment. Sois le premier !
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-5">
          {comments.items.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ul>
      )}

      {comments.totalPages > 1 && (
        <nav
          aria-label="Pagination des commentaires"
          className="mt-6 flex items-center justify-between gap-3"
        >
          {comments.page > 1 ? (
            <Link
              href={href(comments.page - 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Précédents
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            Page {comments.page} sur {comments.totalPages}
          </span>
          {comments.page < comments.totalPages ? (
            <Link
              href={href(comments.page + 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Suivants
              <ChevronRightIcon data-icon="inline-end" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const { author } = comment;
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
        style={author.avatarUrl ? undefined : { backgroundImage: gradientFor(author.id) }}
      >
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          initials(author.displayName)
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-baseline gap-2 text-sm">
            <span className="truncate font-medium">{author.displayName}</span>
            <time
              dateTime={comment.createdAt}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {dateFormat.format(new Date(comment.createdAt))}
            </time>
          </p>
          {comment.isMine && (
            <DeleteCommentButton dropId={comment.dropId} commentId={comment.id} />
          )}
        </div>
        <p className="mt-0.5 whitespace-pre-line break-words text-sm text-foreground/90">
          {comment.content}
        </p>
      </div>
    </li>
  );
}

export function CommentsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement des commentaires" className="mt-10">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-4 h-24 w-full" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="mt-5 flex gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
