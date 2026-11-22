"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { EyeIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePresence, type PresenceStatus, type Viewer } from "@/hooks/use-presence";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 5;
const LEAVE_MS = 380;

type Item = { viewer: Viewer; leaving: boolean };

function useAnimatedViewers(viewers: Viewer[]) {
  const [items, setItems] = useState<Item[]>([]);
  const [source, setSource] = useState<Viewer[] | null>(null);

  if (source !== viewers) {
    setSource(viewers);
    const present = new Set(viewers.map((v) => v.id));
    const next: Item[] = viewers.map((viewer) => ({ viewer, leaving: false }));
    items.forEach((item, index) => {
      if (!present.has(item.viewer.id)) {
        next.splice(Math.min(index, next.length), 0, { ...item, leaving: true });
      }
    });
    setItems(next);
  }

  const hasLeaving = items.some((item) => item.leaving);
  useEffect(() => {
    if (!hasLeaving) return;
    const timer = setTimeout(
      () => setItems((current) => current.filter((item) => !item.leaving)),
      LEAVE_MS,
    );
    return () => clearTimeout(timer);
  }, [hasLeaving, items]);

  return items;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

function gradientFor(id: number) {
  const hue = (id * 67) % 360;
  return `linear-gradient(135deg, oklch(0.72 0.17 ${hue}), oklch(0.58 0.2 ${(hue + 50) % 360}))`;
}

function summary(others: Viewer[], alone: boolean) {
  if (alone) return "Tu es le seul à regarder ce drop";
  const names = others.map((v) => v.displayName);
  if (names.length === 1) return `${names[0]} regarde avec toi`;
  if (names.length === 2) return `${names[0]} et ${names[1]} regardent avec toi`;
  return `${names[0]}, ${names[1]} et ${names.length - 2} autre${names.length - 2 > 1 ? "s" : ""} regardent avec toi`;
}

function Avatar({
  viewer,
  isSelf,
  index,
  leaving,
}: {
  viewer: Viewer;
  isSelf: boolean;
  index: number;
  leaving: boolean;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<li />}
        aria-label={viewer.displayName}
        style={leaving ? undefined : { animationDelay: `${index * 40}ms` }}
        className={cn(
          "relative -ml-2 rounded-full transition-transform duration-200 first:ml-0 hover:z-10 hover:-translate-y-1 hover:scale-110 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring",
          leaving ? "presence-leave pointer-events-none" : "presence-pop",
        )}
        tabIndex={leaving ? -1 : 0}
        aria-hidden={leaving || undefined}
      >
        <span
          className={cn(
            "presence-ring flex size-9 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white shadow-sm ring-2 ring-background",
            isSelf && "ring-emerald-500",
            leaving && "grayscale",
          )}
          style={viewer.avatarUrl ? undefined : { backgroundImage: gradientFor(viewer.id) }}
        >
          {viewer.avatarUrl ? (
            <img src={viewer.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initials(viewer.displayName)
          )}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={10}>
          <Tooltip.Popup className="origin-(--transform-origin) rounded-lg bg-foreground px-3 py-1.5 text-xs text-background shadow-lg transition-[opacity,scale] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <span className="font-medium">
              {viewer.displayName}
              {isSelf && " (toi)"}
            </span>
            <span className="ml-1.5 opacity-60">@{viewer.username}</span>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function Overflow({ viewers }: { viewers: Viewer[] }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<li />}
        tabIndex={0}
        aria-label={`${viewers.length} autres personnes`}
        className="presence-pop relative -ml-2 flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-2 ring-background"
      >
        +{viewers.length}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={10}>
          <Tooltip.Popup className="origin-(--transform-origin) rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg transition-[opacity,scale] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <ul className="flex flex-col gap-0.5">
              {viewers.map((v) => (
                <li key={v.id}>{v.displayName}</li>
              ))}
            </ul>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function LiveBadge({ status }: { status: PresenceStatus }) {
  const live = status === "live";
  const label = live ? "En direct" : status === "offline" ? "Hors ligne" : "Connexion…";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      <span className="relative flex size-2">
        {live && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            live ? "bg-emerald-500" : status === "offline" ? "bg-zinc-400" : "animate-pulse bg-amber-500",
          )}
        />
      </span>
      {label}
    </span>
  );
}

export function Presence({ dropId }: { dropId: number }) {
  const { viewers, selfId, status } = usePresence(dropId);

  const ordered = useMemo(() => {
    const me = viewers.find((v) => v.id === selfId);
    const rest = viewers.filter((v) => v.id !== selfId);
    return me ? [me, ...rest] : rest;
  }, [viewers, selfId]);
  const others = useMemo(() => ordered.filter((v) => v.id !== selfId), [ordered, selfId]);
  const items = useAnimatedViewers(ordered);
  let counted = 0;
  const visible = items.filter((item) => item.leaving || counted++ < MAX_VISIBLE);
  const hidden = items.filter((item) => !item.leaving).slice(MAX_VISIBLE).map((item) => item.viewer);
  const ready = status === "live";

  return (
    <section
      aria-label="Personnes qui regardent ce drop"
      className="mt-5 flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-transparent p-3 pr-5"
    >
      <Tooltip.Provider delay={0} closeDelay={80}>
        {ready && items.length > 0 ? (
          <ul className="flex items-center pl-0.5">
            {visible.map(({ viewer, leaving }, index) => (
              <Avatar
                key={viewer.id}
                viewer={viewer}
                isSelf={viewer.id === selfId}
                index={index}
                leaving={leaving}
              />
            ))}
            {hidden.length > 0 && <Overflow viewers={hidden} />}
          </ul>
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <EyeIcon aria-hidden className="size-4" />
          </div>
        )}
      </Tooltip.Provider>
      <div className="flex min-w-0 flex-col gap-0.5">
        <LiveBadge status={status} />
        <p aria-live="polite" className="truncate text-sm text-foreground/80">
          {ready ? summary(others, others.length === 0) : "Recherche des personnes présentes…"}
        </p>
      </div>
    </section>
  );
}
