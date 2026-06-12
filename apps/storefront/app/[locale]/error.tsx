"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    // Log the error to console/external service
    console.error("Storefront Segment Error Captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-112.5 w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200/50 shadow-lg dark:border-red-900/30">
        <CardHeader className="flex flex-col items-center gap-2 pb-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="mt-2 text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("description")}
          </p>
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-4 max-h-40 overflow-auto rounded border border-red-100 bg-red-50 p-3 text-left font-mono text-xs text-red-800 dark:border-red-950/50 dark:bg-red-950/20 dark:text-red-300">
              <p className="font-semibold">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button
            onClick={() => reset()}
            variant="outline"
            className="flex items-center gap-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <RotateCcw className="h-4 w-4" />
            {t("retryButton")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
