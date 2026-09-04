import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header with Title and Button */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 animate-pulse rounded-md" />
          <Skeleton className="h-4 w-32 animate-pulse rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 animate-pulse rounded-md" />
      </div>

      {/* Search / Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full animate-pulse rounded-md sm:w-80" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 animate-pulse rounded-md" />
          <Skeleton className="h-10 w-24 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="bg-muted/40 border-b p-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-5 w-24 animate-pulse rounded-md" />
            <Skeleton className="h-5 w-32 animate-pulse rounded-md" />
            <Skeleton className="h-5 w-20 animate-pulse rounded-md" />
            <Skeleton className="h-5 w-16 animate-pulse rounded-md" />
          </div>
        </div>
        <div className="space-y-4 divide-y p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 pt-4 first:pt-0">
              <Skeleton className="h-5 w-28 animate-pulse rounded-md" />
              <Skeleton className="h-5 w-40 animate-pulse rounded-md" />
              <Skeleton className="h-5 w-16 animate-pulse rounded-md" />
              <Skeleton className="h-5 w-24 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
