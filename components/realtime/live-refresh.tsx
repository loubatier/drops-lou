"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { useRealtimeEvent } from "@/hooks/use-realtime-event";

const DEBOUNCE_MS = 400;

function useDebouncedRefresh() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => startTransition(() => router.refresh()),
      DEBOUNCE_MS,
    );
  };
}

export function LiveDropsRefresh() {
  const refresh = useDebouncedRefresh();

  useRealtimeEvent("drop:created", refresh);
  useRealtimeEvent("drop:updated", refresh);
  useRealtimeEvent("drop:deleted", refresh);
  useRealtimeEvent("comment:created", refresh);
  useRealtimeEvent("comment:deleted", refresh);
  useRealtimeEvent("settings:updated", refresh);

  return null;
}

export function LiveDropRefresh({ dropId }: { dropId: number }) {
  const router = useRouter();
  const refresh = useDebouncedRefresh();

  useRealtimeEvent("drop:updated", (data) => {
    if (data.drop.id === dropId) refresh();
  });
  useRealtimeEvent("drop:deleted", (data) => {
    if (data.dropId === dropId) router.replace("/drops");
  });
  useRealtimeEvent("comment:created", (data) => {
    if (data.comment.dropId === dropId) refresh();
  });
  useRealtimeEvent("comment:deleted", (data) => {
    if (data.dropId === dropId) refresh();
  });
  useRealtimeEvent("settings:updated", refresh);

  return null;
}
