import { Loader2 } from "lucide-react";

export default function CancelLoading() {
  return (
    <div className="flex animate-pulse items-center justify-center bg-zinc-50 p-4 md:py-6">
      <div className="w-full max-w-md gap-0 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        {/* Header Skeleton */}
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto mb-2 h-16 w-16 animate-spin text-zinc-300" />
          <div className="mx-auto h-8 w-48 rounded-md bg-zinc-200" />
          <div className="mx-auto h-4 w-64 rounded-md bg-zinc-100" />
        </div>

        {/* Content Skeleton */}
        <div className="mt-6 space-y-6">
          <div className="space-y-4 rounded-xl border bg-zinc-50 p-4">
            {/* Order Number */}
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="h-4 w-24 rounded bg-zinc-200" />
            </div>
            {/* Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <div className="h-4 w-16 rounded bg-zinc-200" />
              <div className="h-6 w-24 rounded bg-zinc-200" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="h-12 w-full rounded-xl bg-zinc-200" />
            <div className="h-12 w-full rounded-xl bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
