import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailsSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      {/* Left Side: Image Skeleton */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl lg:w-1/2">
        <Skeleton className="h-full w-full animate-pulse rounded-xl" />
      </div>

      {/* Right Side: Content Skeleton */}
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        {/* Title */}
        <Skeleton className="h-8 w-3/4 animate-pulse rounded-md sm:h-10" />
        {/* Model */}
        <Skeleton className="h-6 w-1/3 animate-pulse rounded-md" />
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-16 animate-pulse rounded-md" />
          <Skeleton className="h-7 w-20 animate-pulse rounded-md" />
          <Skeleton className="h-7 w-14 animate-pulse rounded-md" />
        </div>
        {/* Price */}
        <Skeleton className="h-8 w-44 animate-pulse rounded-md" />

        {/* Detailed Specs Table Skeleton */}
        <div className="mt-6 space-y-4 border-t pt-6">
          <Skeleton className="mb-2 h-6 w-36 animate-pulse rounded-md" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b pb-2">
                <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
                <Skeleton className="h-4 w-16 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
