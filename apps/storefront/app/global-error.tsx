"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations, type Locale } from "next-intl";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console/external service
    console.error("Storefront Global Root Error Captured:", error);
  }, [error]);

  // Dynamic client-side locale detection from URL path
  let locale: Locale = "vi";
  if (typeof window !== "undefined") {
    const segments = window.location.pathname.split("/");
    if (segments[1] === "en") {
      locale = "en";
    }
  }

  const t = useTranslations("ErrorPage");

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <main className="flex grow items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-red-200/50 bg-white p-6 shadow-xl dark:border-red-900/30 dark:bg-zinc-900">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
                  {t("title")}
                </h1>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t("description")}
                </p>
              </div>

              {process.env.NODE_ENV !== "production" && (
                <div className="mt-2 max-h-40 w-full overflow-auto rounded border border-red-100 bg-red-50 p-3 text-left font-mono text-xs text-red-800 dark:border-red-950/50 dark:bg-red-950/20 dark:text-red-300">
                  <p className="font-semibold">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-1 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}

              <button
                onClick={() => reset()}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-800"
              >
                <RotateCcw className="h-4 w-4" />
                {t("retryButton")}
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
