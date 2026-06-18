import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";

export default function AddressesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <Skeleton className="h-8 w-48 rounded-md animate-pulse" />
        <Skeleton className="h-10 w-36 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32 rounded-md animate-pulse" />
                {i === 0 && <Skeleton className="h-5 w-16 rounded-md animate-pulse" />}
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
                <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-md animate-pulse" />
              <Skeleton className="h-4 w-3/4 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
