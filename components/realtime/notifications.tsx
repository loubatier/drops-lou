"use client";

import { XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRealtimeEvent } from "@/hooks/use-realtime-event";
import type { NotificationKind, RealtimeNotification } from "@/lib/realtime";

const MAX_TOASTS = 4;
const TOAST_MS = 6000;

const verbs: Record<NotificationKind, string> = {
  drop_opened: "a ouvert",
  drop_liked: "a aimé",
  drop_commented: "a commenté",
};

type Toast = RealtimeNotification & { key: number };

let nextKey = 0;

export function Notifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useRealtimeEvent("notification", (notification) => {
    setToasts((current) =>
      [{ ...notification, key: nextKey++ }, ...current].slice(0, MAX_TOASTS),
    );
  });

  const dismiss = (key: number) =>
    setToasts((current) => current.filter((toast) => toast.key !== key));

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.key} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (key: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.key), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast.key, onDismiss]);

  return (
    <div className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-background p-3 text-sm shadow-lg animate-in fade-in slide-in-from-right-4">
      <p className="min-w-0 flex-1">
        <span className="font-medium">{toast.by.displayName}</span>{" "}
        {verbs[toast.kind]}{" "}
        <Link
          href={`/drops/${toast.dropId}`}
          onClick={() => onDismiss(toast.key)}
          className="font-medium underline underline-offset-4"
        >
          {toast.dropTitle}
        </Link>
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onDismiss(toast.key)}
        aria-label="Fermer la notification"
      >
        <XIcon aria-hidden className="size-4" />
      </Button>
    </div>
  );
}
