import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <Skeleton className="h-8 w-48 rounded-md animate-pulse" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md animate-pulse" />
        <Skeleton className="h-10 w-5/6 rounded-md animate-pulse" />
        <Skeleton className="h-10 w-4/5 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
