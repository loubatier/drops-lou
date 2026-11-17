"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

export function ExpandableContent({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <ChevronDown
          aria-hidden
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
        {open ? "Masquer le contenu" : "Afficher le contenu"}
      </button>
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
