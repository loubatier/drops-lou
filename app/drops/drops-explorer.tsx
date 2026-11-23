"use client";

import { useMemo, useState } from "react";
import { DropMap } from "@/components/map/drop-map";
import type { Drop } from "@/lib/drops";
import { cn } from "@/lib/utils";

export function DropsExplorer({
  drops,
  cards,
  header,
}: {
  drops: Pick<Drop, "id" | "title" | "location">[];
  cards: React.ReactNode[];
  header: React.ReactNode;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const pins = useMemo(
    () =>
      drops.map((drop) => ({
        id: drop.id,
        title: drop.title,
        lat: drop.location.lat,
        lng: drop.location.lng,
      })),
    [drops],
  );

  function focusCard(id: number) {
    setHoveredId(id);
    document
      .getElementById(`drop-${id}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-3.5625rem)] lg:flex-row">
      <div className="flex min-h-0 flex-col lg:w-[44%] lg:min-w-[28rem] lg:flex-none">
        <div className="shrink-0 px-4 pb-4 pt-6 lg:px-6">{header}</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 lg:px-6">
          {drops.length === 0 && (
            <p className="text-zinc-500">Aucun drop ne correspond.</p>
          )}
          <ul className="flex flex-col gap-4">
            {drops.map((drop, index) => (
              <li
                key={drop.id}
                id={`drop-${drop.id}`}
                onMouseEnter={() => setHoveredId(drop.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(drop.id)}
                onBlur={() => setHoveredId(null)}
                className={cn(
                  "rounded-xl transition-shadow",
                  hoveredId === drop.id && "ring-2 ring-blue-500/60",
                )}
              >
                {cards[index]}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="order-first h-72 shrink-0 border-b lg:order-none lg:h-auto lg:min-w-0 lg:flex-1 lg:border-b-0 lg:border-l">
        <DropMap
          label="Carte des drops"
          pins={pins}
          highlightedId={hoveredId}
          onPinHover={setHoveredId}
          onPinClick={focusCard}
        />
      </div>
    </div>
  );
}
