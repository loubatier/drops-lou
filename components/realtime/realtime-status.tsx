"use client";

import { LockIcon } from "lucide-react";
import { useState } from "react";
import { useRealtimeEvent } from "@/hooks/use-realtime-event";
import { useRealtimeStatus } from "@/hooks/use-realtime-status";
import { onlineCount, type LockMode } from "@/lib/realtime";

export function RealtimeStatus() {
  const status = useRealtimeStatus();
  const [online, setOnline] = useState<number | null>(null);
  const [lockMode, setLockMode] = useState<LockMode>("off");

  useRealtimeEvent(
    "hello",
    (data) => {
      setOnline(onlineCount(data.online));
      setLockMode(data.lockMode);
    },
    { replay: true },
  );
  useRealtimeEvent("presence:online", (data) => setOnline(onlineCount(data.users)), {
    replay: true,
  });
  useRealtimeEvent("settings:updated", (data) => setLockMode(data.lockMode), {
    replay: true,
  });

  if (status !== "live" || online === null) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {lockMode === "on" && (
        <span
          title="Les drops sont verrouillés par la distance"
          className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-400"
        >
          <LockIcon aria-hidden className="size-3" />
          Verrouillage actif
        </span>
      )}
      <span aria-live="polite" className="inline-flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-full bg-emerald-500" />
        {online} en ligne
      </span>
    </div>
  );
}
