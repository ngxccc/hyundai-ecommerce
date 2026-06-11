import { siteConfig } from "@/shared/config/site";
import type { Metadata } from "next";
import { CatalogTemplate } from "@/features/products/components/catalog-template";
import type { CatalogPageProps } from "@/features/products/types/catalog";
import { categoryService } from "@nhatnang/database/services";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";

// 1-hour ISR revalidation window for static pages
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const categoriesList = await categoryService.getAll();
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
  const categories = await categoryService.getAll();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryCatalogPage({
  params,
  searchParams,
}: CatalogPageProps<{ locale: string; slug: string }>) {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;

  const categoryQuery = resolvedSearchParams.category as
    | string
    | string[]
    | undefined;
  if (categoryQuery) {
    const nextParams = new URLSearchParams();
    Object.entries(
      resolvedSearchParams as Record<string, string | string[] | undefined>,
    ).forEach(([key, value]) => {
      if (key !== "category" && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((val) => nextParams.append(key, String(val)));
        } else {
          nextParams.append(key, String(value));
        }
      }
    });
    const queryString = nextParams.toString();
    const targetSlug = Array.isArray(categoryQuery)
      ? categoryQuery[0]!
      : categoryQuery;
    redirect({
      href: `/products/category/${targetSlug}${queryString ? `?${queryString}` : ""}`,
      locale: locale as "vi" | "en",
    });
  }

  // Verify that target category exists, otherwise throw 404
  const categoriesList = await categoryService.getAll();
  const targetCategory = categoriesList.find((cat) => cat.slug === slug);
  if (!targetCategory) {
    notFound();
  }

  return (
    <CatalogTemplate
      title={targetCategory.name}
      categorySlug={slug}
      searchParams={resolvedSearchParams}
    />
  );
}
