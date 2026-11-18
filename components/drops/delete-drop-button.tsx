"use client";

import { LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteDrop, type DeleteState } from "@/lib/drop-actions";

export function DeleteDropButton({ dropId }: { dropId: number }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState<DeleteState>(
    () => deleteDrop(dropId),
    {},
  );

  if (!confirming) {
    return (
      <div className="flex flex-col gap-1">
        <Button type="button" variant="destructive" onClick={() => setConfirming(true)}>
          <Trash2Icon data-icon="inline-start" />
          Supprimer
        </Button>
        {state.message && (
          <p role="alert" className="text-xs text-destructive">
            {state.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2" aria-live="polite">
      <p className="text-sm">Supprimer définitivement ce drop ?</p>
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
          {pending ? "Suppression…" : "Confirmer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Annuler
        </Button>
      </div>
      {state.message && (
        <p role="alert" className="text-xs text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
