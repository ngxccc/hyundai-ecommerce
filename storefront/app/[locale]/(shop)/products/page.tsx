import { Suspense } from "react";
import { siteConfig } from "@/shared/config/site";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { CatalogTemplate } from "@/features/products/components/catalog-template";
import { CatalogTemplateSkeleton } from "@/features/products/components/skeletons/catalog-template-skeleton";
import type { CatalogPageProps } from "@/features/products/types/catalog";
import type { Locale } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("Catalog");
  const localePrefix = locale === "vi" ? "" : `/${locale}`;

  return {
    title: t("title"),
    alternates: {
      canonical: `${siteConfig.url}${localePrefix}/products`,
    },
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps<{ locale: string }>) {
  const { locale } = await params;

  return (
    <Suspense fallback={<CatalogTemplateSkeleton />}>
      <CatalogTemplate searchParams={searchParams} locale={locale as Locale} />
    </Suspense>
  );
}
