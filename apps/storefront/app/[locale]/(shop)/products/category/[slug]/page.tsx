import { CatalogTemplate } from "@/features/products/components/catalog-template";
import type { CatalogPageProps } from "@/features/products/types/catalog";
import { categoryService } from "@nhatnang/database/services";
import { notFound } from "next/navigation";

// 1-hour ISR revalidation window for static pages
export const revalidate = 3600;

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
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

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
