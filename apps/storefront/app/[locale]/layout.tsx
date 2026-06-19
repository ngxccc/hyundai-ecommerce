import { Suspense } from "react";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "@/shared/styles/globals.css";
import { META_THEME_COLORS, siteConfig } from "@/shared/config/site";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { NextIntlClientProvider, type Locale } from "next-intl";
import { Header } from "@/features/home/components";
import { Analytics } from "@vercel/analytics/next";
import { ScrollToTop } from "@nhatnang/ui/components/ui/scroll-to-top";
import { Toaster } from "@nhatnang/ui/components/ui/sonner";
import { CartSync } from "@/features/cart";

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
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  if (!routing.locales.includes(locale)) {
    return {
      title: siteConfig.name,
      description: siteConfig.description,
    };
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${siteConfig.shortName}`,
    },
    metadataBase: new URL(siteConfig.url),
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.shortName, url: siteConfig.url }],
    creator: siteConfig.shortName,
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical: "./" },
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
    const localeStr = String(locale);
    if (localeStr === "[locale]" || !locale) {
      return (
        <html lang="vi">
          <body className="flex min-h-full flex-col">{children}</body>
        </html>
      );
    }
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full font-sans antialiased`}
      suppressHydrationWarning // suppressHydrationWarning để chặn lỗi từ Extensions của trình duyệt
    >
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <LocalizedLayoutContent locale={locale}>
            {children}
          </LocalizedLayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

async function LocalizedLayoutContent({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <CartSync />
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Toaster position="top-center" />
      <ScrollToTop />
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    </NextIntlClientProvider>
  );
}
