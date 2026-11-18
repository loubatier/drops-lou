"use client";

import { LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { useActionState } from "react";
import { deleteComment, type DeleteState } from "@/lib/drop-actions";
import type { Comment } from "@/lib/drop-model";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function CommentItem({ comment }: { comment: Comment }) {
  const [state, action, pending] = useActionState<DeleteState>(
    () => deleteComment(comment.dropId, comment.id),
    {},
  );

  return (
    <li className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {comment.author.displayName}
          </span>
          {comment.isMine && " (toi)"}
        </span>
        <time dateTime={comment.createdAt}>
          {dateFormat.format(new Date(comment.createdAt))}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-line break-words text-sm text-zinc-700 dark:text-zinc-300">
        {comment.content}
      </p>
      {comment.isMine && (
        <form action={action} className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-destructive disabled:cursor-wait"
          >
            {pending ? (
              <LoaderCircleIcon aria-hidden className="size-3.5 animate-spin" />
            ) : (
              <Trash2Icon aria-hidden className="size-3.5" />
            )}
            Supprimer
          </button>
          {state.message && (
            <span role="alert" className="text-xs text-destructive">
              {state.message}
            </span>
          )}
        </form>
      )}
    </li>
  );
}
