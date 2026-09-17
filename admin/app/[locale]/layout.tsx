import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { META_THEME_COLORS } from "@/config/site";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, type Locale } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ThemeProvider } from "@/components/common/theme-provider";
import { CenteredSpinner } from "@/components/common";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: META_THEME_COLORS.dark },
  ],
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminMetadata" });

  return {
    title: {
      template: t("titleTemplate"),
      default: t("defaultTitle"),
    },
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full font-sans antialiased`}
      suppressHydrationWarning // Prevent hydration mismatch warnings from browser extensions
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NextTopLoader
              color="#002C6C"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #002C6C,0 0 5px #002C6C"
            />
            <Suspense fallback={<CenteredSpinner variant="screen" size="lg" />}>
              {children}
            </Suspense>
            <Toaster position="top-right" closeButton />
            <ScrollToTop />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
