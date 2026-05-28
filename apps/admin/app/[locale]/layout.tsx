import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/shared/styles/globals.css";
import { META_THEME_COLORS } from "@/shared/config/site";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, type Locale } from "next-intl";
import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Toaster } from "@nhatnang/ui/components/ui/sonner";
import { ScrollToTop } from "@/shared/components/ScrollToTop";

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
  const t = await getTranslations({ locale, namespace: "AdminMetadata" });

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

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full font-sans antialiased`}
      suppressHydrationWarning // suppressHydrationWarning để chặn lỗi từ Extensions của trình duyệt
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-center" />
          <ScrollToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
