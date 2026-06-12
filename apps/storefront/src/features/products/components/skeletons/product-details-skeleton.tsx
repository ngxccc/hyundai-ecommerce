import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";

export function ProductDetailsSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      {/* Left Side: Image Skeleton */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl lg:w-1/2">
        <Skeleton className="h-full w-full rounded-xl animate-pulse" />
      </div>

      {/* Right Side: Content Skeleton */}
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        {/* Title */}
        <Skeleton className="h-8 w-3/4 rounded-md sm:h-10 animate-pulse" />
        {/* Model */}
        <Skeleton className="h-6 w-1/3 rounded-md animate-pulse" />
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-16 rounded-md animate-pulse" />
          <Skeleton className="h-7 w-20 rounded-md animate-pulse" />
          <Skeleton className="h-7 w-14 rounded-md animate-pulse" />
        </div>
        {/* Price */}
        <Skeleton className="h-8 w-44 rounded-md animate-pulse" />

        {/* Detailed Specs Table Skeleton */}
        <div className="mt-6 border-t pt-6 space-y-4">
          <Skeleton className="h-6 w-36 rounded-md mb-2 animate-pulse" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b pb-2">
                <Skeleton className="h-4 w-24 rounded-md animate-pulse" />
                <Skeleton className="h-4 w-16 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
