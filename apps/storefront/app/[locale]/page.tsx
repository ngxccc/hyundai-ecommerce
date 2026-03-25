import {
  HeroSection,
  CategoriesSection,
  PromotionsSection,
  ProductsSection,
  NewsSection,
  TrustSignalsSection,
} from "@/features/home/components";
import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  // Bắt buộc gọi lại ở Page để Next.js render tĩnh (SSG) mượt mà
  setRequestLocale(locale);
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <PromotionsSection />
      <ProductsSection />
      <NewsSection />
      <TrustSignalsSection />
    </>
  );
}
