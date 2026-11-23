"use client";

import { useSyncExternalStore } from "react";
import { getServerStatus, getStatus, subscribeStatus } from "@/lib/realtime";

export function useRealtimeStatus() {
  return useSyncExternalStore(subscribeStatus, getStatus, getServerStatus);
}
