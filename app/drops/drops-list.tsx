import { CATEGORIES, type Drop } from "@/lib/drops";

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
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {drop.content}
          </p>
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
        <span className="flex gap-3">
          <span>{drop.likedByMe ? "♥" : "♡"} {drop.likesCount}</span>
          <span>💬 {drop.commentsCount}</span>
        </span>
      </div>
    </li>
  );
}
