import { Suspense } from "react";
import { ApiStatus, ApiStatusSkeleton } from "@/components/status/api-status";

export const metadata = { title: "Statut", description: "Statut de l'API" };

export default function StatusPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Statut du service
        </h1>
        <p className="text-sm text-muted-foreground">
          État en temps réel des services qui alimentent Drops.
        </p>
      </header>
      <Suspense fallback={<ApiStatusSkeleton />}>
        <ApiStatus />
      </Suspense>
    </main>
  );
}
