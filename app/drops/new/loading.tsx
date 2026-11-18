import { Skeleton } from "@/components/ui/skeleton";
import { DropFormSkeleton } from "@/components/drops/drop-form-skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 mb-6 h-9 w-56" />
      <DropFormSkeleton />
    </div>
  );
}
