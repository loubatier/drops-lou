"use client";

import { Heart } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { setLike } from "@/lib/drop-actions";
import type { LikeState } from "@/lib/drops";

type LikeButtonProps = {
  dropId: number;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ dropId, initialLiked, initialCount }: LikeButtonProps) {
  const [confirmed, setConfirmed] = useState<LikeState>({
    liked: initialLiked,
    likesCount: initialCount,
  });
  const [optimistic, setOptimistic] = useOptimistic(confirmed);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const liked = !optimistic.liked;
    setError(null);
    startTransition(async () => {
      setOptimistic({
        liked,
        likesCount: Math.max(0, optimistic.likesCount + (liked ? 1 : -1)),
      });
      const result = await setLike(dropId, liked);
      if (result.ok) setConfirmed(result.state);
      else setError(result.message);
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={optimistic.liked}
        aria-label={optimistic.liked ? "Retirer le like" : "Liker ce drop"}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors hover:bg-zinc-100 disabled:cursor-wait dark:hover:bg-zinc-800"
      >
        <Heart
          aria-hidden
          className={`size-4 ${optimistic.liked ? "fill-red-500 text-red-500" : ""}`}
        />
        <span className="tabular-nums">{optimistic.likesCount}</span>
      </button>
      {error && (
        <span role="alert" className="px-2 text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
