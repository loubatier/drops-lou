import Link from "next/link";
import { Suspense } from "react";
import {
  CATEGORIES,
  fetchDrops,
  type Category,
  type DropPage,
  type Sort,
} from "@/lib/drops";
import { DropCard } from "./drops-list";

type Search = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const metadata = { title: "Drops", description: "Liste des drops" };

export default function Home({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return (
    <Suspense
      fallback={
        <p className="mx-auto w-full max-w-3xl px-4 py-10 text-zinc-500">
          Chargement…
        </p>
      }
    >
      <Drops searchParams={searchParams} />
    </Suspense>
  );
}

async function Drops({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = first(sp.q) ?? "";
  const category = CATEGORIES.find((c) => c.id === first(sp.category))?.id;
  const sort: Sort = first(sp.sort) === "popular" ? "popular" : "recent";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  let data: DropPage | null = null;
  let error: string | null = null;
  try {
    data = await fetchDrops({ q: q || undefined, category, sort, page });
  } catch (e) {
    error = e instanceof Error ? e.message : "Erreur inconnue";
  }

  const href = (next: { page?: number; category?: Category | "" }) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const cat = next.category === undefined ? category : next.category;
    if (cat) params.set("category", cat);
    if (sort !== "recent") params.set("sort", sort);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/drops?${qs}` : "/drops";
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Drops</h1>
      {data && (
        <p className="mt-1 text-sm text-zinc-500">
          {data.total} drop{data.total > 1 ? "s" : ""}
        </p>
      )}

      <form className="mt-6 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {category && <input type="hidden" name="category" value={category} />}
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        >
          <option value="recent">Récents</option>
          <option value="popular">Populaires</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Filtrer
        </button>
      </form>

      <nav className="mt-4 flex flex-wrap gap-2">
        {[{ id: "" as const, label: "Tous" }, ...CATEGORIES].map((c) => {
          const active = (category ?? "") === c.id;
          return (
            <Link
              key={c.id}
              href={href({ category: c.id })}
              className={`rounded-full border px-3 py-1 text-sm ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>

      {error && (
        <p role="alert" className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {data && data.items.length === 0 && (
        <p className="mt-8 text-zinc-500">Aucun drop ne correspond.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {data.items.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between text-sm">
          {data.page > 1 ? (
            <Link href={href({ page: data.page - 1 })}>← Précédent</Link>
          ) : (
            <span />
          )}
          <span className="text-zinc-500">
            Page {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link href={href({ page: data.page + 1 })}>Suivant →</Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  );
}
