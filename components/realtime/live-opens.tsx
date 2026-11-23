"use client";

import { useState } from "react";
import { useRealtimeEvent } from "@/hooks/use-realtime-event";

export function LiveOpens({
  dropId,
  initialCount,
}: {
  dropId: number;
  initialCount: number;
}) {
  const [override, setOverride] = useState<{ base: number; count: number } | null>(null);

  useRealtimeEvent("drop:opened", (data) => {
    if (data.dropId === dropId) {
      setOverride({ base: initialCount, count: data.opensCount });
    }
  });

  const count = override && override.base === initialCount ? override.count : initialCount;
  return <span className="tabular-nums">{count}</span>;
}
