"use client";

import { useEffect, useEffectEvent } from "react";
import {
  retain,
  subscribe,
  type RealtimeEvents,
  type RealtimeEventType,
} from "@/lib/realtime";

export function useRealtimeEvent<T extends RealtimeEventType>(
  type: T,
  handler: (data: RealtimeEvents[T]) => void,
  options: { replay?: boolean } = {},
) {
  const onEvent = useEffectEvent(handler);
  const { replay } = options;

  useEffect(() => {
    const release = retain();
    const unsubscribe = subscribe(type, onEvent, { replay });
    return () => {
      unsubscribe();
      release();
    };
  }, [type, replay]);
}
