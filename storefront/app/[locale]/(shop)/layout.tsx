import { Suspense } from "react";
import { Footer } from "@/features/home/components";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {children}
      <Suspense fallback={<div className="min-h-64" />}>
        <Footer />
      </Suspense>
    </>
  );
}
