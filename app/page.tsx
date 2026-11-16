import Link from "next/link";
import { ArrowRightIcon, ActivityIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/drops";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  note: "Des messages laissés sur place.",
  photo: "Des images prises au bon endroit.",
  tip: "Les bons plans des gens du coin.",
  riddle: "Des énigmes à résoudre sur le terrain.",
};

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-4 py-16 sm:py-24">
      <section className="flex flex-col items-start gap-6">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Des messages laissés quelque part, à découvrir.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-pretty">
          Drops rassemble des notes, photos, astuces et énigmes géolocalisées.
          Parcours les derniers drops ou cherche ceux qui t&apos;intéressent.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/drops" className={buttonVariants({ size: "lg" })}>
            Explorer les drops
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <Link
            href="/status"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <ActivityIcon data-icon="inline-start" />
            Statut du service
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="categories">
        <h2 id="categories" className="text-xl font-semibold tracking-tight">
          Parcourir par catégorie
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link
                href={`/drops?category=${category.id}`}
                className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>{category.label}</CardTitle>
                    <CardDescription>
                      {CATEGORY_DESCRIPTIONS[category.id]}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
