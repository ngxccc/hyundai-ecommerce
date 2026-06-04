import { WarehouseHeader, WarehouseGrid } from "@/features/warehouses/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { warehouseService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminDashboard.nav" });

  return {
    title: t("warehouses") || "Warehouses",
  };
}

export default async function AdminWarehousesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminWarehouses.header");
  const warehouses = await warehouseService.getAll();

  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams["search"] === "string" ? resolvedSearchParams["search"] : undefined;

  const filteredWarehouses = search
    ? warehouses.filter(
        (w) =>
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          w.city.toLowerCase().includes(search.toLowerCase()),
      )
    : warehouses;

  return (
    <>
      <WarehouseHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={true}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tHeader("title") },
          ]}
        />
        {/* We can add WarehouseFilters here later if needed */}
        <WarehouseGrid warehouses={filteredWarehouses} />
      </div>
    </>
  );
}
