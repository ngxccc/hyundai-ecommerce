import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";

export default function AddressesLoading() {
  return (
    <div className="space-y-6">
      {/* Header section with border bottom */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <Skeleton className="h-8 w-40 animate-pulse rounded-md" />
        <Skeleton className="h-9 w-32 animate-pulse rounded-md" />
      </div>

      {/* Subheader "Address" */}
      <div className="mb-4">
        <Skeleton className="h-6 w-24 animate-pulse rounded-md" />
      </div>

      {/* Address List skeleton matching the design exactly */}
      <div className="divide-y divide-zinc-200 border-t border-zinc-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start justify-between py-6"
          >
            {/* Left Column: Details */}
            <div className="flex-1 space-y-2 md:pr-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-28 animate-pulse rounded-md" />
                <Skeleton className="h-4 w-4 animate-pulse rounded-md" />
                <Skeleton className="h-5 w-24 animate-pulse rounded-md" />
              </div>
              <div className="mt-2 space-y-1.5">
                <Skeleton className="h-4 w-64 animate-pulse rounded-md" />
                <Skeleton className="h-4 w-48 animate-pulse rounded-md" />
              </div>
              {i === 0 && (
                <Skeleton className="mt-2 h-5 w-16 animate-pulse rounded-full" />
              )}
            </div>

            {/* Right Column: Actions */}
            <div className="hidden md:flex min-w-30 flex-col items-end gap-3">
              <div className="flex gap-3">
                <Skeleton className="h-4 w-8 animate-pulse rounded-md" />
                {i > 0 && (
                  <Skeleton className="h-4 w-8 animate-pulse rounded-md" />
                )}
              </div>
              {i > 0 && (
                <Skeleton className="h-8 w-28 animate-pulse rounded-md" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
