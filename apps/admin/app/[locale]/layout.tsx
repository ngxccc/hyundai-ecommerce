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
import { Toaster } from "@/shared/components/ui/sonner";
import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { AdminSidebar } from "@/features/dashboard/components/admin-sidebar";
import { getCachedSession } from "@/shared/lib/session";

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

  const session = await getCachedSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full font-sans antialiased`}
      suppressHydrationWarning // suppressHydrationWarning để chặn lỗi từ Extensions của trình duyệt
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <div className="bg-background text-foreground flex h-screen overflow-hidden font-sans">
            {isAdmin && <AdminSidebar />}
            <main className="bg-background relative flex h-screen flex-1 flex-col overflow-y-auto">
              <div className="mx-auto flex w-full flex-1 flex-col pb-4">
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-center" />
          <ScrollToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
