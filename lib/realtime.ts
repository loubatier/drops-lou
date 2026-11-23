import type { Drop } from "@/lib/drops";
import type { Comment } from "@/lib/comments";

export type PublicUser = {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Viewer = PublicUser;
export type LockMode = "on" | "off";
export type NotificationKind = "drop_opened" | "drop_liked" | "drop_commented";
export type ConnectionStatus = "connecting" | "live" | "reconnecting" | "offline";

export type RealtimeNotification = {
  kind: NotificationKind;
  dropId: number;
  dropTitle: string;
  by: PublicUser;
  at: string;
};

export type RealtimeEvents = {
  hello: {
    user: PublicUser;
    serverTime: string;
    lockMode: LockMode;
    online: number | PublicUser[];
  };
  pong: { serverTime: string };
  "presence:online": { users: number | PublicUser[] };
  "presence:drop": { dropId: number; viewers: Viewer[] };
  "drop:created": { drop: Drop };
  "drop:updated": { drop: Drop };
  "drop:deleted": { dropId: number };
  "drop:opened": { dropId: number; opensCount: number };
  "like:updated": { dropId: number; likesCount: number };
  "comment:created": { comment: Comment };
  "comment:deleted": { dropId: number; commentId: number };
  notification: RealtimeNotification;
  "settings:updated": { lockMode: LockMode };
  error: { code: "bad_message" | "drop_not_found"; message: string };
};

export type RealtimeEventType = keyof RealtimeEvents;

type Listener = (data: never) => void;

const NO_RECONNECT = [4001, 4008, 4009];
const MAX_DELAY_MS = 15000;
const CLOSE_GRACE_MS = 1000;
const STICKY: RealtimeEventType[] = ["hello", "presence:online", "settings:updated"];

const listeners = new Map<string, Set<Listener>>();
const openListeners = new Set<() => void>();
const statusListeners = new Set<() => void>();
const sticky = new Map<string, unknown>();

let socket: WebSocket | null = null;
let status: ConnectionStatus = "connecting";
let refs = 0;
let attempt = 0;
let generation = 0;
let fatal = false;
let started = false;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function setStatus(next: ConnectionStatus) {
  if (status === next) return;
  status = next;
  statusListeners.forEach((listener) => listener());
}

function dispatch(type: string, data: unknown) {
  listeners.get(type)?.forEach((listener) => (listener as (d: unknown) => void)(data));
}

function scheduleReconnect(current: number) {
  attempt += 1;
  setStatus("reconnecting");
  reconnectTimer = setTimeout(
    () => connect(current),
    Math.min(1000 * 2 ** attempt, MAX_DELAY_MS),
  );
}

async function connect(current: number) {
  let url: string;
  try {
    const res = await fetch("/api/realtime/ticket", { method: "POST" });
    if (current !== generation) return;
    if (res.status === 401) {
      fatal = true;
      return setStatus("offline");
    }
    if (!res.ok) return scheduleReconnect(current);
    ({ url } = await res.json());
  } catch {
    if (current === generation) scheduleReconnect(current);
    return;
  }
  if (current !== generation) return;

  const ws = new WebSocket(url);
  socket = ws;

  ws.onopen = () => {
    attempt = 0;
    setStatus("live");
    openListeners.forEach((listener) => listener());
  };

  ws.onmessage = (event) => {
    let message: { type: string; data: unknown };
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (STICKY.includes(message.type as RealtimeEventType)) {
      sticky.set(message.type, message.data);
    }
    dispatch(message.type, message.data);
  };

  ws.onclose = (event) => {
    if (current !== generation || socket !== ws) return;
    socket = null;
    if (NO_RECONNECT.includes(event.code)) {
      fatal = true;
      return setStatus("offline");
    }
    if (event.code === 1000) return setStatus("offline");
    scheduleReconnect(current);
  };
}

function shutdown() {
  generation += 1;
  clearTimeout(reconnectTimer);
  const ws = socket;
  socket = null;
  ws?.close(1000);
  fatal = false;
  started = false;
  attempt = 0;
  sticky.clear();
  setStatus("connecting");
}

export function retain() {
  refs += 1;
  clearTimeout(closeTimer);
  if (!started && !fatal) {
    started = true;
    connect(generation);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    refs -= 1;
    if (refs === 0) closeTimer = setTimeout(shutdown, CLOSE_GRACE_MS);
  };
}

export function subscribe<T extends RealtimeEventType>(
  type: T,
  listener: (data: RealtimeEvents[T]) => void,
  options: { replay?: boolean } = {},
) {
  let set = listeners.get(type);
  if (!set) listeners.set(type, (set = new Set()));
  set.add(listener as Listener);
  if (options.replay && sticky.has(type)) {
    listener(sticky.get(type) as RealtimeEvents[T]);
  }
  return () => {
    set.delete(listener as Listener);
  };
}

export function onOpen(listener: () => void) {
  openListeners.add(listener);
  if (socket?.readyState === WebSocket.OPEN) listener();
  return () => {
    openListeners.delete(listener);
  };
}

export function send(type: string, data: unknown = {}) {
  if (socket?.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify({ type, data }));
  return true;
}

export function subscribeStatus(listener: () => void) {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

export const getStatus = () => status;
export const getServerStatus = (): ConnectionStatus => "connecting";

export const onlineCount = (online: number | PublicUser[]) =>
  Array.isArray(online) ? online.length : online;
