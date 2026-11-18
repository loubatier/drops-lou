import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DropForm } from "@/components/drops/drop-form";
import { createDrop } from "@/lib/drop-actions";

export const metadata = { title: "Nouveau drop" };

export default function NewDropPage() {
  return (
    <>
      <Link
        href="/drops"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Retour aux drops
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Nouveau drop</h1>
      <div className="mt-6">
        <DropForm
          action={createDrop}
          submitLabel="Publier"
          pendingLabel="Publication…"
          cancelHref="/drops"
        />
      </div>
    </>
  );
}
