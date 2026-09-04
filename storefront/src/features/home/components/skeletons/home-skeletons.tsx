import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/features/products";
import { NewsCardSkeleton } from "./news-card-skeleton";

export function CategoriesSectionSkeleton() {
  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto h-10 w-64 rounded-md uppercase" />
          <Skeleton className="mx-auto mt-2 h-4 w-48 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <Skeleton className="h-64 rounded-xl md:col-span-8" />
          <Skeleton className="h-64 rounded-xl md:col-span-4" />
          <Skeleton className="h-64 rounded-xl md:col-span-4" />
          <Skeleton className="h-64 rounded-xl md:col-span-8" />
        </div>
      </div>
    </section>
  );
}

export function PromotionsSectionSkeleton() {
  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </section>
  );
}

export function ProductsSectionSkeleton() {
  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Skeleton className="h-10 w-72 animate-pulse rounded-md" />
            <Skeleton className="h-4 w-52 animate-pulse rounded-md" />
          </div>
          <Skeleton className="h-10 w-28 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsSectionSkeleton() {
  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Skeleton className="h-10 w-72 animate-pulse rounded-md" />
            <Skeleton className="h-4 w-52 animate-pulse rounded-md" />
          </div>
          <Skeleton className="h-10 w-28 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
