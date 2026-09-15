import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card size="dense" className="h-full gap-4 overflow-hidden">
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

      <CardFooter className="bg-muted/10 mt-auto flex flex-col gap-2.5 border-t p-3.5">
        <div className="flex w-full items-baseline justify-between gap-2">
          <Skeleton className="h-5 w-28 rounded-sm" />
        </div>
        <div className="flex w-full items-center gap-1.5">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="size-8 shrink-0 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}
