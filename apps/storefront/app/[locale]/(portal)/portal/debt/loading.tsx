import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import { Card } from "@nhatnang/ui/components/ui/card";

export default function DebtLoading() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="border-b pb-4">
        <Skeleton className="h-7 w-48 animate-pulse rounded-md" />
        <Skeleton className="mt-2 h-4 w-96 animate-pulse rounded-md" />
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs"
          >
            <Skeleton className="h-3 w-24 animate-pulse rounded-md" />
            <Skeleton className="mt-3 h-8 w-36 animate-pulse rounded-md" />
          </Card>
        ))}
      </div>

      {/* Form Area Skeleton */}
      <Card className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs">
        <div className="space-y-6">
          {/* Amount input skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 animate-pulse rounded-md" />
            <Skeleton className="h-10 w-full animate-pulse rounded-md" />
            <Skeleton className="h-3 w-48 animate-pulse rounded-md" />
          </div>

          {/* Payment method selection skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-36 animate-pulse rounded-md" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4"
                >
                  <Skeleton className="h-4 w-4 animate-pulse rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 animate-pulse rounded-md" />
                    <Skeleton className="h-3 w-40 animate-pulse rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit button skeleton */}
          <Skeleton className="h-10 w-full animate-pulse rounded-md" />
        </div>
      </Card>
    </div>
  );
}
