"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card className="border-destructive/30 w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center gap-2 pb-2 text-center">
          <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-6 w-6" />
          </div>
          <CardTitle size="xl" className="text-destructive mt-2 tracking-tight">
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("description")}
          </p>
          {process.env.NODE_ENV !== "production" && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive mt-4 max-h-40 overflow-auto rounded border p-3 text-left font-mono text-xs">
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
            onClick={() => {
              reset();
            }}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("retryButton")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
