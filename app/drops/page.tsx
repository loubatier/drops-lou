import Link from "next/link";
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

  const href = (next: { category?: Category | "" }) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const cat = next.category === undefined ? category : next.category;
    if (cat) params.set("category", cat);
    if (sort !== "recent") params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/drops?${qs}` : "/drops";
  };

  if (sp.q === "") redirect(href({}));

  const data = await fetchDrops({ q: q || undefined, category, sort });

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Drops</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {data.total} drop{data.total > 1 ? "s" : ""}
      </p>

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
        <p className="mt-8 text-zinc-500">Aucun drop ne correspond.</p>
      )}

      {data.items.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {data.items.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </ul>
      )}
    </>
  );
}
