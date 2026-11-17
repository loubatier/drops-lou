"use client";

import { RouteError } from "@/components/route/route-error";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      title="Impossible de charger ce drop"
      backHref="/drops"
      backLabel="Retour aux drops"
    />
  );
}
