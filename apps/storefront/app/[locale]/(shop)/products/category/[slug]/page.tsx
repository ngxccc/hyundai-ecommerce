import { Suspense } from "react";
import { siteConfig } from "@/shared/config/site";
import type { Metadata } from "next";
import { CatalogTemplate } from "@/features/products/components/catalog-template";
import type { CatalogPageProps } from "@/features/products/types/catalog";
import { categoryService } from "@/shared/services";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const categoriesList = await categoryService.getCategories();
  const targetCategory = categoriesList.find((cat) => cat.slug === slug);

  if (!targetCategory) {
    return {};
  }

  const localePrefix = locale === "vi" ? "" : `/${locale}`;

  return {
    title: targetCategory.name,
    alternates: {
      canonical: `${siteConfig.url}${localePrefix}/products/category/${slug}`,
    },
  };
}

// Statically pre-render all category landing pages
export async function generateStaticParams() {
  const categories = await categoryService.getCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryCatalogPage({
  params,
  searchParams,
}: CatalogPageProps<{ locale: string; slug: string }>) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  // Verify that target category exists, otherwise throw 404
  const categoriesList = await categoryService.getCategories();
  const targetCategory = categoriesList.find((cat) => cat.slug === slug);
  if (!targetCategory) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <CatalogTemplate
        title={targetCategory.name}
        categorySlug={slug}
        searchParams={searchParams}
        locale={locale as Locale}
      />
    </Suspense>
  );
}
