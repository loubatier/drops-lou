import { ArrowLeft, PencilIcon } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/drops/comment-form";
import { CommentItem } from "@/components/drops/comment-item";
import { DeleteDropButton } from "@/components/drops/delete-drop-button";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, fetchComments, fetchDrop } from "@/lib/drops";
import { LikeButton } from "@/app/like-button";

const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

export const metadata = { title: "Drop" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ comments?: string }>;
};

export default async function DropPage({ params, searchParams }: PageProps) {
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
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments params={params} searchParams={searchParams} />
      </Suspense>
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
          {drop.hidden && " · masqué"}
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
      {drop.isMine && (
        <div className="mt-6 flex flex-wrap items-start gap-2 border-t pt-6">
          <Link
            href={`/drops/${drop.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            <PencilIcon data-icon="inline-start" />
            Modifier
          </Link>
          <DeleteDropButton dropId={drop.id} />
        </div>
      )}
    </article>
  );
}

async function Comments({
  params,
  searchParams,
}: Pick<PageProps, "params" | "searchParams">) {
  const [{ id }, { comments }] = await Promise.all([params, searchParams]);
  const requested = Number.parseInt(comments ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;
  const data = await fetchComments(id, page);
  if (!data) return null;

  const base = `/drops/${id}`;
  const hrefFor = (target: number) =>
    target > 1 ? `${base}?comments=${target}` : base;

  return (
    <section aria-labelledby="comments-title" className="mt-8 border-t pt-6">
      <h2 id="comments-title" className="text-lg font-semibold">
        Commentaires{" "}
        <span className="font-normal text-zinc-500">({data.total})</span>
      </h2>
      <div className="mt-4">
        <CommentForm dropId={Number(id)} />
      </div>
      {data.items.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          Aucun commentaire pour l&apos;instant. Lance la conversation !
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {data.items.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ul>
      )}
      {data.totalPages > 1 && (
        <nav
          aria-label="Pagination des commentaires"
          className="mt-6 flex items-center justify-between text-sm"
        >
          {data.page > 1 ? (
            <Link href={hrefFor(data.page - 1)} className="hover:underline">
              ← Précédents
            </Link>
          ) : (
            <span />
          )}
          <span className="text-zinc-500">
            Page {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link href={hrefFor(data.page + 1)} className="hover:underline">
              Suivants →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  );
}

function CommentsSkeleton() {
  return (
    <div className="mt-8 border-t pt-6" aria-busy="true">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-4 h-24 w-full" />
      <Skeleton className="mt-6 h-14 w-full" />
    </div>
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
