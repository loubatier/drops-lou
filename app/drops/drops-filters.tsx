"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Sort } from "@/lib/drops";

const SEARCH_DEBOUNCE_MS = 300;

const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Récents" },
  { value: "popular", label: "Populaires" },
];

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
      <Input
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
        className="min-w-0 flex-1"
      />
      <Select
        items={SORTS}
        value={sort}
        onValueChange={(value) => apply({ sort: value as Sort })}
      >
        <SelectTrigger aria-label="Trier">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
