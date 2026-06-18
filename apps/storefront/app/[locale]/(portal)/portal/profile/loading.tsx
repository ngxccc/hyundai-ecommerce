import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <Skeleton className="h-8 w-48 rounded-md animate-pulse" />
      </div>
      <div className="space-y-6">
        {/* Row 1: Name and Email */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md animate-pulse" />
            <Skeleton className="h-10 w-full rounded-md animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md animate-pulse" />
            <Skeleton className="h-10 w-full rounded-md animate-pulse" />
          </div>
        </div>
        {/* Row 2: Phone */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-md animate-pulse" />
          <Skeleton className="h-10 w-full md:w-1/2 rounded-md animate-pulse" />
        </div>
        {/* B2B Section */}
        <div className="border-t pt-6 space-y-4">
          <Skeleton className="h-6 w-40 rounded-md animate-pulse" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md animate-pulse" />
              <Skeleton className="h-10 w-full rounded-md animate-pulse" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md animate-pulse" />
              <Skeleton className="h-10 w-full rounded-md animate-pulse" />
            </div>
          </div>
        </div>
        {/* Save button */}
        <div className="flex justify-end border-t pt-6">
          <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
