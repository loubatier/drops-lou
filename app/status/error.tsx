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
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <RouteError error={error} retry={retry} title="Statut indisponible" />
    </main>
  );
}
