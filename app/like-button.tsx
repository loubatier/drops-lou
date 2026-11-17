"use client";

import { useState } from "react";

type LikeButtonProps = {
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const count = initialCount + (liked === initialLiked ? 0 : liked ? 1 : -1);

  return (
    <button
      type="button"
      onClick={() => setLiked((value) => !value)}
      aria-pressed={liked}
      aria-label={liked ? "Retirer le like" : "Liker ce drop"}
      className="flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className={liked ? "text-red-500" : undefined}>
        {liked ? "♥" : "♡"}
      </span>
      <span>{count}</span>
    </button>
  );
}
