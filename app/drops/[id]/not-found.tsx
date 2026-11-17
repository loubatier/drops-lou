import { RouteNotFound } from "@/components/route/route-not-found";

export default function NotFound() {
  return (
    <RouteNotFound
      title="Drop introuvable"
      description="Ce drop n'existe pas ou a été supprimé."
      backHref="/drops"
      backLabel="Retour aux drops"
    />
  );
}
