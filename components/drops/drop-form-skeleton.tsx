import { Skeleton } from "@/components/ui/skeleton";

export function DropFormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement du formulaire" className="flex flex-col gap-5">
      {[8, 8, 24, 8].map((height, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="w-full" style={{ height: `${height * 4}px` }} />
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
