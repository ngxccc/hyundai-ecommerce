import { Suspense } from "react";
import {
  HeroSection,
  ProductsSection,
  NewsSection,
} from "@/features/home/components";
import {
  ProductsSectionSkeleton,
  NewsSectionSkeleton,
} from "@/features/home/components/skeletons/home-skeletons";
import type { Locale } from "next-intl";
export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <Suspense fallback={<div className="min-h-[80vh]" />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<ProductsSectionSkeleton />}>
        <ProductsSection />
      </Suspense>
      <Suspense fallback={<NewsSectionSkeleton />}>
        <NewsSection />
      </Suspense>
    </>
  );
}
