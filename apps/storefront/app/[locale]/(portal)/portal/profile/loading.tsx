import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b pb-4">
        <Skeleton className="h-8 w-48 animate-pulse rounded-md" />
      </div>

      <div className="space-y-6">
        {/* Personal Info Section */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
              <Skeleton className="h-10 w-full animate-pulse rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
              <Skeleton className="h-10 w-full animate-pulse rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
            <Skeleton className="h-10 w-full animate-pulse rounded-md" />
          </div>
        </section>

        {/* Separator */}
        <div className="border-t border-zinc-200" />

        {/* B2B Section */}
        <section className="space-y-4">
          <Skeleton className="h-4 w-48 animate-pulse rounded-md" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Company Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
              <Skeleton className="h-10 w-full animate-pulse rounded-md" />
            </div>
            {/* Tax ID */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
              <Skeleton className="h-10 w-full animate-pulse rounded-md" />
            </div>
            {/* Business Type */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
              <Skeleton className="h-10 w-full animate-pulse rounded-md" />
            </div>
            {/* Province */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse rounded-md" />
              <Skeleton className="h-10 w-full animate-pulse rounded-md" />
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end border-t pt-6">
          <Skeleton className="h-10 w-32 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
