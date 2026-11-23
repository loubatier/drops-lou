"use client";

import { MapPinIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, startTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropMap } from "@/components/map/drop-map";
import { saveDrop, type DropFormState } from "@/lib/drops-actions";
import { CATEGORIES, type Category } from "@/lib/drop-categories";
import type { Drop } from "@/lib/drops";
import { formatPosition, type LatLng } from "@/lib/map";
import { cn } from "@/lib/utils";

const initialState: DropFormState = {};

export function DropDialog({ drop }: { drop?: Drop }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const editing = Boolean(drop);

  function handleSaved(id: number) {
    setOpen(false);
    if (editing) router.refresh();
    else router.push(`/drops/${id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={editing ? "outline" : "default"}>
            {editing ? (
              <PencilIcon data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            {editing ? "Modifier" : "Créer un drop"}
          </Button>
        }
      />
      <DialogContent>
        <DialogTitle>{editing ? "Modifier le drop" : "Nouveau drop"}</DialogTitle>
        <DialogDescription>
          Clique sur la carte, dans la zone en pointillés, pour placer le drop, puis glisse le pin pour l&apos;ajuster.
        </DialogDescription>
        <DropForm drop={drop} onSaved={handleSaved} />
      </DialogContent>
    </Dialog>
  );
}

function DropForm({
  drop,
  onSaved,
}: {
  drop?: Drop;
  onSaved: (id: number) => void;
}) {
  const id = useId();
  const [state, action, pending] = useActionState(saveDrop, initialState);
  const [category, setCategory] = useState<Category>(drop?.category ?? "note");
  const [position, setPosition] = useState<LatLng | null>(
    drop ? { lat: drop.location.lat, lng: drop.location.lng } : null,
  );
  const [outOfZone, setOutOfZone] = useState(false);

  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  });
  useEffect(() => {
    if (state.savedId !== undefined) onSavedRef.current(state.savedId);
  }, [state.savedId]);

  const error = (key: string) => state.fields?.[key]?.join(" ");
  const locationError = outOfZone
    ? "Ce point est hors de la zone autorisée (3 km autour du département MMI)."
    : error("location");

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-4 flex flex-col gap-4"
    >
      {drop && <input type="hidden" name="dropId" value={drop.id} />}
      <input type="hidden" name="lat" value={position?.lat ?? ""} />
      <input type="hidden" name="lng" value={position?.lng ?? ""} />

      {state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Field id={`${id}-title`} label="Titre" error={error("title")}>
        <Input
          id={`${id}-title`}
          name="title"
          defaultValue={drop?.title}
          maxLength={120}
          aria-invalid={Boolean(error("title"))}
        />
      </Field>

      <Field id={`${id}-content`} label="Contenu" error={error("content")}>
        <Textarea
          id={`${id}-content`}
          name="content"
          defaultValue={drop?.content ?? ""}
          rows={3}
          aria-invalid={Boolean(error("content"))}
        />
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Catégorie</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <label
              key={item.id}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-sm has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                category === item.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              <input
                type="radio"
                name="category"
                value={item.id}
                checked={category === item.id}
                onChange={() => setCategory(item.id)}
                className="sr-only"
              />
              {item.label}
            </label>
          ))}
        </div>
        {error("category") && (
          <p className="mt-1 text-xs text-destructive">{error("category")}</p>
        )}
      </fieldset>

      {category === "photo" && (
        <Field id={`${id}-image`} label="URL de l'image" error={error("imageUrl")}>
          <Input
            id={`${id}-image`}
            name="imageUrl"
            type="url"
            defaultValue={drop?.imageUrl ?? ""}
            placeholder="https://…"
            aria-invalid={Boolean(error("imageUrl"))}
          />
        </Field>
      )}

      <div>
        <p className="mb-1.5 text-sm font-medium">Position</p>
        <div
          className={cn(
            "h-64 overflow-hidden rounded-lg border",
            locationError && "border-destructive",
          )}
        >
          <DropMap
            label="Carte pour choisir la position du drop"
            selectable
            value={position}
            onSelect={(next) => {
              setOutOfZone(false);
              setPosition(next);
            }}
            onOutOfZone={() => setOutOfZone(true)}
          />
        </div>
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs",
            locationError ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <MapPinIcon aria-hidden className="size-3.5" />
          {locationError ??
            (position ? formatPosition(position) : "Aucun point choisi")}
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : drop ? "Enregistrer" : "Publier"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
