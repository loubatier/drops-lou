"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRealtimeEvent } from "@/hooks/use-realtime-event";
import { setLike } from "@/lib/drops-actions";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  dropId: number;
  initialLiked: boolean;
  initialCount: number;
  className?: string;
};

type State = { liked: boolean; count: number };

export function LikeButton({
  dropId,
  initialLiked,
  initialCount,
  className,
}: LikeButtonProps) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<State>({
    liked: initialLiked,
    count: initialCount,
  });
  const [optimistic, setOptimistic] = useOptimistic(
    confirmed,
    (_current, next: State) => next,
  );
  const [error, setError] = useState<string | null>(null);

  useRealtimeEvent("like:updated", (data) => {
    if (data.dropId === dropId) {
      setConfirmed((current) => ({ ...current, count: data.likesCount }));
    }
  });
  const [, startTransition] = useTransition();

  const toggle = () => {
    const next: State = {
      liked: !optimistic.liked,
      count: optimistic.count + (optimistic.liked ? -1 : 1),
    };
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      const result = await setLike(dropId, next.liked);
      if (result.ok) {
        setConfirmed({
          liked: result.state.liked,
          count: result.state.likesCount,
        });
        return;
      }
      if (result.unauthorized) {
        router.push("/login");
        return;
      }
      setError(result.message);
    });
  };

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={toggle}
        aria-pressed={optimistic.liked}
        aria-label={optimistic.liked ? "Retirer le like" : "Liker ce drop"}
        className={cn(
          "rounded-full",
          className,
        )}
      >
        <Heart
          aria-hidden
          className={cn(
            "size-4 transition-transform active:scale-125",
            optimistic.liked && "fill-red-500 text-red-500",
          )}
        />
        <span className="tabular-nums">{optimistic.count}</span>
      </Button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
