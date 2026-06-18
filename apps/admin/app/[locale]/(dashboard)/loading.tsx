import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header with Title and Button */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md animate-pulse" />
          <Skeleton className="h-4 w-32 rounded-md animate-pulse" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
      </div>

      {/* Search / Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:w-80 rounded-md animate-pulse" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-md animate-pulse" />
          <Skeleton className="h-10 w-24 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="border-b bg-muted/40 p-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-5 w-24 rounded-md animate-pulse" />
            <Skeleton className="h-5 w-32 rounded-md animate-pulse" />
            <Skeleton className="h-5 w-20 rounded-md animate-pulse" />
            <Skeleton className="h-5 w-16 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="divide-y p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 pt-4 first:pt-0">
              <Skeleton className="h-5 w-28 rounded-md animate-pulse" />
              <Skeleton className="h-5 w-40 rounded-md animate-pulse" />
              <Skeleton className="h-5 w-16 rounded-md animate-pulse" />
              <Skeleton className="h-5 w-24 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
