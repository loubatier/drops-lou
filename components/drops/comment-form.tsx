"use client";

import { SendIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { addComment, type CommentFormState } from "@/lib/comments-actions";
import { COMMENT_MAX_LENGTH } from "@/lib/comment-limits";
import { cn } from "@/lib/utils";

const initialState: CommentFormState = {};

export function CommentForm({ dropId }: { dropId: number }) {
  const [state, action, pending] = useActionState(addComment, initialState);
  const [length, setLength] = useState(0);
  const [lastPosted, setLastPosted] = useState(state.posted);

  if (state.posted !== lastPosted) {
    setLastPosted(state.posted);
    setLength(state.content?.length ?? 0);
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="dropId" value={dropId} />
      {state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <label htmlFor="comment-content" className="sr-only">
        Ton commentaire
      </label>
      <textarea
        id="comment-content"
        name="content"
        key={state.posted ?? 0}
        defaultValue={state.content}
        onChange={(event) => setLength(event.target.value.length)}
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="Ajoute un commentaire…"
        required
        className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-xs text-muted-foreground",
            length >= COMMENT_MAX_LENGTH && "text-destructive",
          )}
        >
          {length}/{COMMENT_MAX_LENGTH}
        </span>
        <Button type="submit" disabled={pending}>
          <SendIcon data-icon="inline-start" />
          {pending ? "Envoi…" : "Publier"}
        </Button>
      </div>
    </form>
  );
}
