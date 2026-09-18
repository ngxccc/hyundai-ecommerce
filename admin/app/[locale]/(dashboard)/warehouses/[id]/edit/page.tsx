import { Suspense } from "react";
import { warehousesApi } from "@/features/warehouses/api/warehouses.api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { WarehouseForm } from "@/features/warehouses/components/warehouse-form";
import { CenteredSpinner } from "@/components/common";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "adminWarehouseForm",
  });

  return {
    title: t("editTitle"),
  };
}

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [tNav, tForm] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminWarehouseForm"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("warehouses"), href: "/warehouses" },
          { label: tForm("editTitle") },
        ]}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <EditWarehouseContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditWarehouseContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const { data: res } = await warehousesApi.getById(id);
  const warehouse = res?.data;

  if (!warehouse) {
    notFound();
  }

  return <WarehouseForm initialData={warehouse} />;
}
