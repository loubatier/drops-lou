import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement des drops">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-4 w-20" />
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
      <ul className="mt-6 flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <Skeleton className="h-40 w-full rounded-xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}
