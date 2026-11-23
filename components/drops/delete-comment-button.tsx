"use client";

import { Trash2Icon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { deleteComment } from "@/lib/comments-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon-xs"
      disabled={pending}
      aria-label="Supprimer le commentaire"
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2Icon />
    </Button>
  );
}

export function DeleteCommentButton({
  dropId,
  commentId,
}: {
  dropId: number;
  commentId: number;
}) {
  return (
    <form action={deleteComment}>
      <input type="hidden" name="dropId" value={dropId} />
      <input type="hidden" name="commentId" value={commentId} />
      <SubmitButton />
    </form>
  );
}
