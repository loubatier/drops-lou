"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";

export function ExpandableContent({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
      >
        <ChevronDown
          aria-hidden
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
        {open ? "Masquer le contenu" : "Afficher le contenu"}
      </Button>
      <p
        id={id}
        hidden={!open}
        className="mt-2 text-sm text-zinc-700 dark:text-zinc-300"
      >
        {content}
      </p>
    </div>
  );
}
