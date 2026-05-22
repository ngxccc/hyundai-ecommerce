import { Suspense, type ReactNode } from "react";

interface AuthPageShellProps {
  children: ReactNode;
  fallbackLabel: string;
  fallbackClassName?: string;
}

const AuthPageLoadingFallback = ({
  label,
  className = "max-w-md",
}: {
  label: string;
  className?: string | undefined;
}) => (
  <div
    className={`flex h-64 w-full ${className} items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950`}
  >
    <div className="text-muted-foreground text-center text-sm">{label}</div>
  </div>
);

export const AuthPageShell = ({
  children,
  fallbackLabel,
  fallbackClassName,
}: AuthPageShellProps) => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-zinc-950">
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
