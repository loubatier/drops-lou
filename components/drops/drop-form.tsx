"use client";

import { LoaderCircleIcon, LocateFixedIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/auth/actions";
import { CATEGORIES, type Category } from "@/lib/drop-model";

type DropFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: Record<string, string>;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
};

const EMPTY: Record<string, string> = {
  title: "",
  content: "",
  category: "note",
  imageUrl: "",
  lat: "",
  lng: "",
};

export function DropForm({
  action,
  initialValues = EMPTY,
  submitLabel,
  pendingLabel,
  cancelHref,
}: DropFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initialValues;
  const fields = state.fields ?? {};
  const [category, setCategory] = useState<string>(initialValues.category);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  function locate() {
    if (!("geolocation" in navigator)) {
      setLocationError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (latRef.current) latRef.current.value = coords.latitude.toFixed(6);
        if (lngRef.current) lngRef.current.value = coords.longitude.toFixed(6);
        setLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Autorisation refusée. Saisis les coordonnées à la main."
            : "Position introuvable. Saisis les coordonnées à la main.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const locationErrors = fields.location;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <fieldset disabled={pending} className="flex flex-col gap-5">
        <FieldShell name="title" label="Titre" errors={fields.title}>
          <Input
            id="title"
            name="title"
            defaultValue={values.title}
            aria-invalid={fields.title ? true : undefined}
            aria-describedby={fields.title ? "title-error" : undefined}
            required
          />
        </FieldShell>

        <FieldShell name="category" label="Catégorie" errors={fields.category}>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            aria-invalid={fields.category ? true : undefined}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell name="content" label="Contenu" errors={fields.content}>
          <Textarea
            id="content"
            name="content"
            rows={5}
            defaultValue={values.content}
            aria-invalid={fields.content ? true : undefined}
            aria-describedby={fields.content ? "content-error" : undefined}
            required
          />
        </FieldShell>

        <FieldShell
          name="imageUrl"
          label={category === "photo" ? "URL de l'image" : "URL de l'image (facultatif)"}
          errors={fields.imageUrl}
        >
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            inputMode="url"
            placeholder="https://…"
            defaultValue={values.imageUrl}
            aria-invalid={fields.imageUrl ? true : undefined}
            aria-describedby={fields.imageUrl ? "imageUrl-error" : undefined}
            required={category === "photo"}
          />
        </FieldShell>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Position</span>
            <Button type="button" variant="outline" size="sm" onClick={locate} disabled={locating}>
              {locating ? (
                <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <LocateFixedIcon data-icon="inline-start" />
              )}
              {locating ? "Localisation…" : "Ma position"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              ref={latRef}
              name="lat"
              aria-label="Latitude"
              placeholder="Latitude"
              inputMode="decimal"
              defaultValue={values.lat}
              aria-invalid={locationErrors ? true : undefined}
              aria-describedby={locationErrors ? "location-error" : undefined}
              required
            />
            <Input
              ref={lngRef}
              name="lng"
              aria-label="Longitude"
              placeholder="Longitude"
              inputMode="decimal"
              defaultValue={values.lng}
              aria-invalid={locationErrors ? true : undefined}
              aria-describedby={locationErrors ? "location-error" : undefined}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Le point doit être à 3 km au plus du département MMI, pour ne pas révéler où tu habites.
          </p>
          {locationErrors && (
            <p id="location-error" className="text-xs text-destructive">
              {locationErrors.join(" ")}
            </p>
          )}
          {locationError && (
            <p role="status" className="text-xs text-destructive">
              {locationError}
            </p>
          )}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
          {pending ? pendingLabel : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Annuler
        </Link>
      </div>
    </form>
  );
}

function FieldShell({
  name,
  label,
  errors,
  children,
}: {
  name: string;
  label: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {errors && (
        <p id={`${name}-error`} className="text-xs text-destructive">
          {errors.join(" ")}
        </p>
      )}
    </div>
  );
}
