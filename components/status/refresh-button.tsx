"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCwIcon className={pending ? "animate-spin" : undefined} />
      {pending ? "Vérification…" : "Revérifier"}
    </Button>
  );
}
