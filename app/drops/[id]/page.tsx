import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LikeButton } from "@/components/drops/like-button";
import { Presence } from "@/components/drops/presence";
import { CATEGORIES, fetchDrop } from "@/lib/drops";

const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

export const metadata = { title: "Drop" };

export default async function DropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <Link
        href="/drops"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Retour aux drops
      </Link>
      <DropDetail params={params} />
    </>
  );
}

async function DropDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const drop = await fetchDrop(id);
  if (!drop) notFound();

  return (
    <article className="mt-6">
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
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {drop.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        par{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          {drop.author.displayName}
        </span>
      </p>
      <Presence dropId={drop.id} />
      {drop.locked ? (
        <p className="mt-4 italic text-zinc-500">
          Drop verrouillé : rapproche-toi pour l&apos;ouvrir.
        </p>
      ) : (
        drop.content && (
          <p className="mt-4 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
            {drop.content}
          </p>
        )
      )}
      {drop.imageUrl && (
        <img
          src={drop.imageUrl}
          alt={drop.title}
          className="mt-4 w-full rounded-lg object-cover"
        />
      )}
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat
          label="Likes"
          value={
            <LikeButton
              dropId={drop.id}
              initialLiked={drop.likedByMe}
              initialCount={drop.likesCount}
              className="-ml-2.5 -my-1"
            />
          }
        />
        <Stat label="Commentaires" value={drop.commentsCount} />
        <Stat label="Ouvertures" value={drop.opensCount} />
        <Stat
          label="Position"
          value={`${drop.location.lat.toFixed(4)}, ${drop.location.lng.toFixed(4)}${
            drop.location.precision === "approx" ? " (approx.)" : ""
          }`}
        />
      </dl>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
