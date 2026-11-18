import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, type Drop } from "@/lib/drops";
import { LikeButton } from "@/app/like-button";
import { ExpandableContent } from "./expandable-content";

const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function DropCard({ drop }: { drop: Drop }) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
          {categoryLabel[drop.category]}
        </span>
        <time
          dateTime={drop.createdAt}
          className="text-xs text-zinc-500 dark:text-zinc-400"
        >
          {dateFormat.format(new Date(drop.createdAt))}
        </time>
      </div>
      <h2 className="mt-3 text-lg font-semibold">{drop.title}</h2>
      {drop.locked ? (
        <p className="mt-1 text-sm italic text-zinc-500">
          Drop verrouillé : rapproche-toi pour l&apos;ouvrir.
        </p>
      ) : (
        drop.content && (
          <div className="mt-2">
            <ExpandableContent content={drop.content} />
          </div>
        )
      )}
      {drop.imageUrl && (
        <img
          src={drop.imageUrl}
          alt={drop.title}
          className="mt-3 max-h-64 w-full rounded-lg object-cover"
        />
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          par{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {drop.author.displayName}
          </span>{" "}
          · {drop.location.lat.toFixed(4)}, {drop.location.lng.toFixed(4)}
          {drop.location.precision === "approx" && " (approx.)"}
        </span>
        <span className="flex items-center gap-3">
          <LikeButton
            dropId={drop.id}
            initialLiked={drop.likedByMe}
            initialCount={drop.likesCount}
          />
          <span>💬 {drop.commentsCount}</span>
        </span>
      </div>
      <Link
        href={`/drops/${drop.id}`}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Voir le drop
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </li>
  );
}
