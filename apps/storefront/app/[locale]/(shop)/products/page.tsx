import { CatalogTemplate } from "@/features/products/components/catalog-template";
import type { CatalogPageProps } from "@/features/products/types/catalog";

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps<{ locale: string }>) {
  await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category;

  return (
    <CatalogTemplate
      categorySlug={categorySlug}
      searchParams={resolvedSearchParams}
    />
  );
}
