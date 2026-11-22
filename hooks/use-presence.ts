"use client";

import { useEffect, useState } from "react";

export type Viewer = {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type PresenceStatus = "connecting" | "live" | "reconnecting" | "offline";

type ServerMessage =
  | { type: "hello"; data: { user: Viewer } }
  | { type: "presence:drop"; data: { dropId: number; viewers: Viewer[] } };

const NO_RECONNECT = [4001, 4008, 4009];
const MAX_DELAY_MS = 15000;

export function usePresence(dropId: number) {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [selfId, setSelfId] = useState<number | null>(null);
  const [status, setStatus] = useState<PresenceStatus>("connecting");

  useEffect(() => {
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let stopped = false;

    function scheduleReconnect() {
      attempt += 1;
      setStatus("reconnecting");
      timer = setTimeout(connect, Math.min(1000 * 2 ** attempt, MAX_DELAY_MS));
    }

    async function connect() {
      let url: string;
      try {
        const res = await fetch("/api/realtime/ticket", { method: "POST" });
        if (stopped) return;
        if (res.status === 401) return setStatus("offline");
        if (!res.ok) return scheduleReconnect();
        ({ url } = await res.json());
      } catch {
        if (!stopped) scheduleReconnect();
        return;
      }
      if (stopped) return;

      const ws = new WebSocket(url);
      socket = ws;

      ws.onopen = () => {
        attempt = 0;
        ws.send(JSON.stringify({ type: "presence:view", data: { dropId } }));
      };

      ws.onmessage = (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "hello") {
          setSelfId(message.data.user.id);
        } else if (
          message.type === "presence:drop" &&
          message.data.dropId === dropId
        ) {
          setViewers(message.data.viewers);
          setStatus("live");
        }
      };

      ws.onclose = (event) => {
        if (stopped || socket !== ws) return;
        if (NO_RECONNECT.includes(event.code)) return setStatus("offline");
        scheduleReconnect();
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(timer);
      socket?.close(1000);
    };
  }, [dropId]);

  return { viewers, selfId, status };
}
