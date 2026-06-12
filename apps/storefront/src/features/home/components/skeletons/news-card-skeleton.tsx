import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@nhatnang/ui/components/ui/card";

export function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <article className="flex h-full flex-col sm:flex-row">
        {/* Left Side (Image Skeleton) */}
        <CardHeader className="relative aspect-4/3 min-h-50 shrink-0 p-0 sm:aspect-auto sm:w-2/5">
          <Skeleton className="h-full w-full rounded-none" />
        </CardHeader>

        {/* Right Side (Content Skeleton) */}
        <div className="flex flex-1 flex-col">
          <CardContent className="grow space-y-3 p-6 pb-2">
            <Skeleton className="h-6 w-5/6 rounded-md" />
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-11/12 rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
          </CardContent>

          <CardFooter className="mt-auto px-6 pt-0 pb-6">
            <Skeleton className="h-4 w-24 rounded-md" />
          </CardFooter>
        </div>
      </article>
    </Card>
  );
}
