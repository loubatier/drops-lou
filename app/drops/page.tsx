import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { redirect } from "next/navigation";
import {
  CATEGORIES,
  fetchDrops,
  type Category,
  type Sort,
} from "@/lib/drops";
import { DropCard } from "./drops-list";
import { DropsFilters } from "./drops-filters";

type Search = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const metadata = { title: "Drops", description: "Liste des drops" };

export default function DropsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <Drops searchParams={searchParams} />;
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
  const requestedPage = Number(first(sp.page));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 1 ? requestedPage : 1;

  const href = (next: { category?: Category | ""; page?: number }) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const cat = next.category === undefined ? category : next.category;
    if (cat) params.set("category", cat);
    if (sort !== "recent") params.set("sort", sort);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/drops?${qs}` : "/drops";
  };

  if (sp.q === "") redirect(href({}));

  const data = await fetchDrops({ q: q || undefined, category, sort, page });
  if (data.totalPages > 0 && page > data.totalPages) {
    redirect(href({ page: data.totalPages }));
  }
  const filtered = Boolean(q || category);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Drops</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {data.total} drop{data.total > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/drops/new" className={buttonVariants()}>
          <PlusIcon data-icon="inline-start" />
          Nouveau drop
        </Link>
      </div>

      <DropsFilters q={q} category={category} sort={sort} />

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

      {data.items.length === 0 && (
        <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-dashed p-8 text-zinc-500">
          <p>
            {filtered
              ? "Aucun drop ne correspond à ta recherche."
              : "Aucun drop pour le moment. Sois le premier à en déposer un."}
          </p>
          {filtered ? (
            <Link href="/drops" className={buttonVariants({ variant: "outline" })}>
              Réinitialiser les filtres
            </Link>
          ) : (
            <Link href="/drops/new" className={buttonVariants()}>
              Créer un drop
            </Link>
          )}
        </div>
      )}

      {data.items.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {data.items.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </ul>
      )}

      {data.totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-between gap-3 text-sm"
        >
          {page > 1 ? (
            <Link
              href={href({ page: page - 1 })}
              className={buttonVariants({ variant: "outline" })}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-zinc-500">
            Page {page} sur {data.totalPages}
          </span>
          {page < data.totalPages ? (
            <Link
              href={href({ page: page + 1 })}
              className={buttonVariants({ variant: "outline" })}
            >
              Suivant
              <ChevronRightIcon data-icon="inline-end" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
