import { RouteNotFound } from "@/components/route/route-not-found";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <RouteNotFound
        title="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée."
        backHref="/"
        backLabel="Retour à l'accueil"
      />
    </main>
  );
}
