"use client";

import { useEffect, useState } from "react";
import { useRealtimeEvent } from "@/hooks/use-realtime-event";
import { useRealtimeStatus } from "@/hooks/use-realtime-status";
import {
  onOpen,
  retain,
  send,
  subscribe,
  type ConnectionStatus,
  type Viewer,
} from "@/lib/realtime";

export type { Viewer };
export type PresenceStatus = ConnectionStatus;

export function usePresence(dropId: number) {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loadedFor, setLoadedFor] = useState<number | null>(null);
  const [selfId, setSelfId] = useState<number | null>(null);
  const connection = useRealtimeStatus();

  useRealtimeEvent("hello", (data) => setSelfId(data.user.id), { replay: true });

  useEffect(() => {
    const release = retain();
    const offOpen = onOpen(() => send("presence:view", { dropId }));
    const off = subscribe("presence:drop", (data) => {
      if (data.dropId !== dropId) return;
      setViewers(data.viewers);
      setLoadedFor(dropId);
    });
    return () => {
      off();
      offOpen();
      send("presence:leave");
      release();
    };
  }, [dropId]);

  const status: PresenceStatus =
    connection === "live" && loadedFor !== dropId ? "connecting" : connection;

  return { viewers, selfId, status };
}
