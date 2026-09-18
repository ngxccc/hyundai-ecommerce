import { Suspense } from "react";
import { WarehouseHeader } from "@/features/warehouses/components";
import { DataTableSearchInput } from "@/components/common/data-table-search-input";
import { warehousesApi } from "@/features/warehouses/api/warehouses.api";
import { WarehouseTable } from "@/features/warehouses/components/warehouse-table";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import type { AdminWarehouse } from "@/types/api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { connection } from "next/server";
import type { Metadata } from "next";
import { CenteredSpinner } from "@/components/common";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminDashboard.nav" });

  return {
    title: t("warehouses"),
  };
}

export default async function AdminWarehousesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [tNav, tHeader] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminWarehouses.header"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("warehouses") },
        ]}
      />

      <WarehouseHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={true}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <WarehousesContent
          searchParams={searchParams}
          searchPlaceholder={tHeader("searchPlaceholder")}
        />
      </Suspense>
    </div>
  );
}

async function WarehousesContent({
  searchParams,
  searchPlaceholder,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  searchPlaceholder: string;
}) {
  await connection();
  const { data: res } = await warehousesApi.list();
  const warehouses: AdminWarehouse[] = res?.data ?? [];

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;

  const searchLower = search?.trim().toLowerCase();
  const filteredWarehouses = searchLower
    ? warehouses.filter((w) =>
        [w.nameVi, w.nameEn, w.city, w.district].some((field) =>
          field?.toLowerCase().includes(searchLower),
        ),
      )
    : warehouses;

  return (
    <div className="flex w-full flex-col gap-4">
      <DataTableSearchInput placeholder={searchPlaceholder} />
      <WarehouseTable warehouses={filteredWarehouses} />
    </div>
  );
}
