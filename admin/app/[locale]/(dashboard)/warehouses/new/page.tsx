import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import {
  WarehouseForm,
  WarehouseHeader,
} from "@/features/warehouses/components";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { connection } from "next/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminWarehouseForm" });

  return {
    title: t("title"),
  };
}

export default async function NewWarehousePage() {
  await connection();
  const tNav = await getTranslations("adminDashboard.nav");
  const tForm = await getTranslations("adminWarehouseForm");
  const tHeader = await getTranslations("adminWarehouses.header");

  const breadcrumbs = (
    <AdminBreadcrumbs
      items={[
        { label: tNav("overview"), href: "/" },
        { label: tHeader("title"), href: "/warehouses" },
        { label: tForm("title") },
      ]}
    />
  );

  return (
    <>
      <WarehouseHeader
        title={tForm("title")}
        description={tForm("description")}
        showAddButton={false}
      />
      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <WarehouseForm breadcrumbs={breadcrumbs} />
      </div>
    </>
  );
}
