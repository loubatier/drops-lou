"use client";

import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";

export function RouteError({
  error,
  retry,
  title = "Une erreur est survenue",
  backHref = "/",
  backLabel = "Retour à l'accueil",
}: {
  error: unknown;
  retry: () => void;
  title?: string;
  backHref?: string;
  backLabel?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message =
    error instanceof Error && error.message
      ? error.message
      : "Impossible de charger cette page pour le moment.";

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => retry()}>Réessayer</Button>
        <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
