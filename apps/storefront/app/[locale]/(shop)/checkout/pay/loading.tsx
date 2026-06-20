import { Loader2 } from "lucide-react";

export default function CheckoutPayLoading() {
  return (
    <div className="flex items-center justify-center bg-zinc-50 p-4 md:py-6 animate-pulse">
      <div className="w-full max-w-md gap-0 overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm md:max-w-4xl">
        {/* Header Skeleton */}
        <div className="border-b bg-zinc-50/50 pt-8 pb-6 text-center">
          <Loader2 className="mx-auto mb-3 h-16 w-16 animate-spin text-zinc-300" />
          <div className="mx-auto h-8 w-48 rounded-md bg-zinc-200" />
          <div className="mx-auto mt-2 h-4 w-64 rounded-md bg-zinc-100" />
        </div>

        {/* Content Skeleton */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left Column Skeleton (Order Summary) */}
            <div className="flex flex-col justify-between space-y-6 md:col-span-7">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-4 w-28 rounded bg-zinc-200" />
                  <div className="h-10 w-full rounded bg-zinc-100" />
                </div>
                <div className="space-y-4 rounded-sm border bg-zinc-50/50 p-5">
                  {/* Order Number */}
                  <div className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-zinc-200" />
                    <div className="h-4 w-20 rounded bg-zinc-200" />
                  </div>
                  {/* Shipping Address */}
                  <div className="flex flex-col gap-2 border-t pt-3">
                    <div className="h-3 w-32 rounded bg-zinc-200" />
                    <div className="h-4 w-full rounded bg-zinc-200" />
                  </div>
                  {/* Items List */}
                  <div className="space-y-3 border-t pt-3">
                    <div className="h-3 w-28 rounded bg-zinc-200" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-40 rounded bg-zinc-200" />
                        <div className="h-4 w-16 rounded bg-zinc-200" />
                      </div>
                    </div>
                  </div>
                  {/* Shipping Fee */}
                  <div className="flex justify-between border-t pt-3">
                    <div className="h-4 w-24 rounded bg-zinc-200" />
                    <div className="h-4 w-16 rounded bg-zinc-200" />
                  </div>
                  {/* Total */}
                  <div className="flex justify-between border-t pt-3">
                    <div className="h-4 w-20 rounded bg-zinc-200" />
                    <div className="h-5 w-24 rounded bg-zinc-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton (VietQR Code & Bank Details) */}
            <div className="space-y-6 border-zinc-100 md:col-span-5 md:border-l md:pl-8">
              <div className="flex flex-col items-center justify-center rounded-sm border border-zinc-100 bg-zinc-50 p-4">
                <div className="h-4 w-24 rounded bg-zinc-200 mb-3" />
                <div className="relative flex h-64 w-64 items-center justify-center rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                  <div className="h-full w-full rounded bg-zinc-100" />
                </div>
              </div>
              <div className="space-y-3 rounded-sm border bg-zinc-50 p-4">
                <div className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-zinc-200" />
                  <div className="h-4 w-12 rounded bg-zinc-200" />
                </div>
                <div className="flex justify-between border-t pt-2">
                  <div className="h-4 w-24 rounded bg-zinc-200" />
                  <div className="h-4 w-28 rounded bg-zinc-200" />
                </div>
                <div className="flex justify-between border-t pt-2">
                  <div className="h-4 w-20 rounded bg-zinc-200" />
                  <div className="h-4 w-32 rounded bg-zinc-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
