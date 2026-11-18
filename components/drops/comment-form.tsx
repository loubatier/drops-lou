"use client";

import { LoaderCircleIcon, SendIcon } from "lucide-react";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/drop-actions";
import { COMMENT_MAX_LENGTH } from "@/lib/drop-model";

export function CommentForm({ dropId }: { dropId: number }) {
  const [state, action, pending] = useActionState(addComment.bind(null, dropId), {});
  const error = state.message ?? state.fields?.content?.[0];

  return (
    <form action={action} noValidate className="flex flex-col gap-2">
      <label htmlFor="comment-content" className="sr-only">
        Ton commentaire
      </label>
      <Textarea
        id="comment-content"
        name="content"
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="Ajoute un commentaire…"
        defaultValue={state.values?.content ?? ""}
        aria-invalid={error ? true : undefined}
        disabled={pending}
      />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-500">
          {COMMENT_MAX_LENGTH} caractères max.
        </span>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          {pending ? "Envoi…" : "Commenter"}
        </Button>
      </div>
    </form>
  );
}
