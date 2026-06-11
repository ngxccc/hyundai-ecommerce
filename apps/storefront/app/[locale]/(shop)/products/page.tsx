import { siteConfig } from "@/shared/config/site";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { CatalogTemplate } from "@/features/products/components/catalog-template";
import type { CatalogPageProps } from "@/features/products/types/catalog";
import { redirect } from "@/i18n/routing";

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
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category as
    | string
    | string[]
    | undefined;

  if (categorySlug) {
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
    const targetSlug = Array.isArray(categorySlug)
      ? categorySlug[0]!
      : categorySlug;
    redirect({
      href: `/products/category/${targetSlug}${queryString ? `?${queryString}` : ""}`,
      locale: locale as "vi" | "en",
    });
  }

  return <CatalogTemplate searchParams={resolvedSearchParams} />;
}
