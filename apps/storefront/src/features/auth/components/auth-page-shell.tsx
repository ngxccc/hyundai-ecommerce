import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@nhatnang/ui/components/ui/card";

interface AuthPageShellProps {
  children: ReactNode;
  fallbackLabel: string;
  fallbackClassName?: string;
}

const AuthPageLoadingFallback = ({
  className = "max-w-md",
}: {
  label: string;
  className?: string | undefined;
}) => (
  <Card className={`w-full ${className} shadow-lg`}>
    <CardHeader className="space-y-2">
      <Skeleton className="h-6 w-32 rounded-md" />
      <Skeleton className="h-4 w-48 rounded-md" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-12 w-full rounded-md mt-4" />
      <div className="flex justify-center pt-2">
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

export const AuthPageShell = ({
  children,
  fallbackLabel,
  fallbackClassName,
}: AuthPageShellProps) => {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <Suspense
        fallback={
          <AuthPageLoadingFallback
            label={fallbackLabel}
            className={fallbackClassName}
          />
        }
      >
        {children}
      </Suspense>
    </div>
  );
};
