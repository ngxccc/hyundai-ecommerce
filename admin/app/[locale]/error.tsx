"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const t = useTranslations("errorPage");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log segment error for observability
    console.error("[Admin Segment Error Captured]:", error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center space-y-6">
        {/* Error Icon Badge with Soft Glow */}
        <div className="bg-destructive/10 text-destructive ring-destructive/5 flex size-20 items-center justify-center rounded-full ring-8 transition-all">
          <AlertTriangle className="size-10 stroke-[2.25]" />
        </div>

        {/* Error Heading & Status Tag */}
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="border-destructive/20 bg-destructive/10 text-destructive inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase">
            <Terminal className="size-3.5" />
            {t("status")}
          </span>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
        </div>

        {/* Descriptive Message */}
        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed sm:text-base">
          {t("description")}
        </p>

        {/* Optional Error Digest Badge */}
        {error.digest && (
          <div className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[11px]">
            <span>{t("digest", { digest: error.digest })}</span>
          </div>
        )}

        {/* Action Buttons: Try Again & Back to Dashboard */}
        <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 pt-1 sm:max-w-none sm:flex-row">
          <Button
            onClick={() => reset()}
            variant="default"
            size="default"
            className="w-full gap-2 font-semibold shadow-xs sm:w-auto"
          >
            <RotateCcw className="size-4" />
            <span>{t("retryButton")}</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="default"
            className="w-full gap-2 font-medium shadow-xs sm:w-auto"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>{t("homeButton")}</span>
            </Link>
          </Button>
        </div>

        {/* Technical Error Details (Collapsible & Safe in Non-Production) */}
        {process.env.NODE_ENV !== "production" && (
          <div className="w-full pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground gap-1.5 text-xs font-medium"
            >
              <span>{t("technicalDetails")}</span>
              {showDetails ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>

            {showDetails && (
              <div className="bg-muted/60 border-border/80 text-foreground [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 relative mt-3 max-h-56 w-full [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] overflow-auto rounded-xl border p-4 text-left font-mono text-xs shadow-xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                <p className="text-destructive font-bold">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-muted-foreground mt-2.5 text-[11px] leading-relaxed whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
