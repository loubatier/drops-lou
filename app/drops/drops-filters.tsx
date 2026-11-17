"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Category, Sort } from "@/lib/drops";

const SEARCH_DEBOUNCE_MS = 300;

type DropsFiltersProps = {
  q: string;
  category?: Category;
  sort: Sort;
};

export function DropsFilters({ q, category, sort }: DropsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(next: { q?: string; sort?: Sort }) {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextSort = next.sort ?? sort;
    if (nextQ) params.set("q", nextQ);
    if (category) params.set("category", category);
    if (nextSort !== "recent") params.set("sort", nextSort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(timer.current);
        const value = new FormData(event.currentTarget).get("q");
        apply({ q: typeof value === "string" ? value.trim() : "" });
      }}
      className="mt-6 flex flex-wrap gap-2"
    >
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Rechercher…"
        aria-label="Rechercher"
        onChange={(event) => {
          const value = event.target.value.trim();
          clearTimeout(timer.current);
          timer.current = setTimeout(() => apply({ q: value }), SEARCH_DEBOUNCE_MS);
        }}
        className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
      />
      <div className="relative">
        <select
          name="sort"
          value={sort}
          aria-label="Trier"
          onChange={(event) => apply({ sort: event.target.value as Sort })}
          className="h-full appearance-none rounded-lg border border-zinc-300 bg-transparent py-2 pl-3 pr-9 text-sm dark:border-zinc-700"
        >
          <option value="recent">Récents</option>
          <option value="popular">Populaires</option>
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
        />
      </div>
    </form>
  );
}
