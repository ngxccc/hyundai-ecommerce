import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-0">
      {/* Page Title */}
      <div className="mb-4">
        <Skeleton className="h-10 w-48 animate-pulse rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
        {/* Mobile-only Collapsible Header Skeleton */}
        <div className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:hidden">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 animate-pulse rounded-md" />
            <Skeleton className="h-6 w-24 animate-pulse rounded-md" />
          </div>
        </div>

        {/* Left Column (Shipping Address, Payment Options, Methods) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping Address Card Skeleton */}
          <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <Skeleton className="h-6 w-48 animate-pulse rounded-md" />
                <Skeleton className="h-9 w-32 animate-pulse rounded-md" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 animate-pulse rounded-md" />
                  <Skeleton className="h-10 w-full animate-pulse rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 animate-pulse rounded-md" />
                  <Skeleton className="h-10 w-full animate-pulse rounded-md" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28 animate-pulse rounded-md" />
                <Skeleton className="h-10 w-full animate-pulse rounded-md" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 animate-pulse rounded-md" />
                  <Skeleton className="h-10 w-full animate-pulse rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 animate-pulse rounded-md" />
                  <Skeleton className="h-10 w-full animate-pulse rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Option Card Skeleton */}
          <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-36 animate-pulse rounded-md" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full animate-pulse rounded-xl" />
                <Skeleton className="h-16 w-full animate-pulse rounded-xl" />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card Skeleton */}
          <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-36 animate-pulse rounded-md" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-zinc-200 p-4"
                  >
                    <Skeleton className="mt-1 h-4 w-4 animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32 animate-pulse rounded-md" />
                      <Skeleton className="h-4 w-5/6 animate-pulse rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Order Summary Desktop) */}
        <div className="space-y-6">
          <Card className="hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:block">
            <CardContent className="space-y-6 p-6">
              <Skeleton className="h-6 w-36 animate-pulse rounded-md" />

              {/* Cart Items list */}
              <div className="max-h-80 space-y-4 overflow-y-auto">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full animate-pulse rounded-md" />
                      <Skeleton className="h-3 w-24 animate-pulse rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-16 animate-pulse rounded-md" />
                  </div>
                ))}
              </div>

              <hr className="border-zinc-100" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16 animate-pulse rounded-md" />
                  <Skeleton className="h-4 w-20 animate-pulse rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16 animate-pulse rounded-md" />
                  <Skeleton className="h-4 w-20 animate-pulse rounded-md" />
                </div>
                <hr className="border-zinc-100" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24 animate-pulse rounded-md" />
                  <Skeleton className="h-6 w-28 animate-pulse rounded-md" />
                </div>
              </div>

              {/* Submit Button */}
              <Skeleton className="h-11 w-full animate-pulse rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar Skeleton */}
      <div className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between gap-4 border-t border-zinc-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20 animate-pulse rounded-md" />
          <Skeleton className="h-6 w-28 animate-pulse rounded-md" />
        </div>
        <Skeleton className="h-11 w-32 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
