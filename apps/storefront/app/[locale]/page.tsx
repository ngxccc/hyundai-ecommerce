import {
  HeroSection,
  CategoriesSection,
  PromotionsSection,
  ProductsSection,
  NewsSection,
  TrustSignalsSection,
} from "@/features/home/components";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

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
