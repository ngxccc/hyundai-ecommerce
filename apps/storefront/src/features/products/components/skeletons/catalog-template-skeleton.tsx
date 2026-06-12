import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import { ProductCardSkeleton } from "./product-card-skeleton";

export function CatalogTemplateSkeleton() {
  return (
    <div className="bg-background min-h-screen pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header Skeleton */}
        <div className="mb-8 border-b pb-4">
          <Skeleton className="h-10 w-64 rounded-md md:h-12 md:w-96 animate-pulse" />
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters Sidebar Skeleton (Desktop) */}
          <div className="hidden lg:block">
            <div className="bg-muted/10 sticky top-24 rounded-lg border p-4 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-11/12 rounded-md" />
                <Skeleton className="h-8 w-4/5 rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-5/6 rounded-md" />
              </div>
            </div>
          </div>

          {/* Filters Sheet Skeleton (Mobile) */}
          <div className="lg:hidden">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Product Listing */}
          <div className="space-y-6 lg:col-span-3">
            {/* Top Bar Skeleton */}
            <div className="flex items-center justify-between border-b pb-4">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-10 w-44 rounded-md" />
            </div>

            {/* Active Filter Chips Skeleton */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
