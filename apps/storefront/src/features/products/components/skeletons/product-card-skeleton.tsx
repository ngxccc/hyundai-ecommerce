import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@nhatnang/ui/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 overflow-hidden py-0">
      <CardHeader className="relative aspect-4/3 w-full p-0">
        <Skeleton className="h-full w-full rounded-none" />
      </CardHeader>

      <CardContent className="flex grow flex-col gap-2">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <div className="mt-2 space-y-2">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
          <Skeleton className="h-3.5 w-2/3 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 mt-auto flex items-center justify-between gap-1 border-t p-4 pt-4! lg:flex-col lg:items-stretch lg:w-full lg:gap-2">
        <Skeleton className="h-7 w-24 rounded-md lg:w-1/2" />
        <Skeleton className="h-10 w-28 rounded-md lg:w-full" />
      </CardFooter>
    </Card>
  );
}
