import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DropForm } from "@/components/drops/drop-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { updateDrop } from "@/lib/drop-actions";
import { fetchDrop } from "@/lib/drops";

export const metadata = { title: "Modifier le drop" };

export default function EditDropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <EditDrop params={params} />;
}

async function EditDrop({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const drop = await fetchDrop(id);
  if (!drop) notFound();

  const back = (
    <Link
      href={`/drops/${drop.id}`}
      className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      <ArrowLeft aria-hidden className="size-4" />
      Retour au drop
    </Link>
  );

  if (!drop.isMine) {
    return (
      <>
        {back}
        <div className="mt-6 flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertDescription>
              Seul l&apos;auteur peut modifier ce drop.
            </AlertDescription>
          </Alert>
          <Link
            href={`/drops/${drop.id}`}
            className={buttonVariants({ variant: "outline" }) + " self-start"}
          >
            Voir le drop
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {back}
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Modifier le drop</h1>
      <div className="mt-6">
        <DropForm
          action={updateDrop.bind(null, drop.id)}
          initialValues={{
            title: drop.title,
            content: drop.content ?? "",
            category: drop.category,
            imageUrl: drop.imageUrl ?? "",
            lat: String(drop.location.lat),
            lng: String(drop.location.lng),
          }}
          submitLabel="Enregistrer"
          pendingLabel="Enregistrement…"
          cancelHref={`/drops/${drop.id}`}
        />
      </div>
    </>
  );
}
