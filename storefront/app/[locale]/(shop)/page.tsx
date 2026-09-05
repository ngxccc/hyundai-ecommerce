import { Suspense } from "react";
import {
  HeroSection,
  CategoriesSection,
  PromotionsSection,
  ProductsSection,
  NewsSection,
  TrustSignalsSection,
} from "@/features/home/components";
import {
  CategoriesSectionSkeleton,
  ProductsSectionSkeleton,
  NewsSectionSkeleton,
  PromotionsSectionSkeleton,
} from "@/features/home/components/skeletons/home-skeletons";
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
      <Suspense fallback={<div className="min-h-[80vh]" />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<CategoriesSectionSkeleton />}>
        <CategoriesSection />
      </Suspense>
      <Suspense fallback={<PromotionsSectionSkeleton />}>
        <PromotionsSection />
      </Suspense>
      <Suspense fallback={<ProductsSectionSkeleton />}>
        <ProductsSection />
      </Suspense>
      <Suspense fallback={<NewsSectionSkeleton />}>
        <NewsSection />
      </Suspense>
      <Suspense fallback={<div className="h-32" />}>
        <TrustSignalsSection />
      </Suspense>
    </>
  );
}
