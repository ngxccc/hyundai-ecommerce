import { notFound } from "next/navigation";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import {
  WarehouseForm,
  WarehouseHeader,
} from "@/features/warehouses/components";
import { api } from "@/lib/api-client";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import type { Metadata } from "next";

export const generateStaticParams = () => {
  return []; // SSR for edit pages
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminWarehouseForm" });

  return {
    title: t("editTitle"),
  };
}

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  const { data: res } = await api.GET("/warehouses/{id}", {
    params: { path: { id } },
  });
  const warehouse = res?.data;
  if (!warehouse) {
    notFound();
  }

  const tNav = await getTranslations("AdminDashboard.nav");
  const tForm = await getTranslations("AdminWarehouseForm");
  const tHeader = await getTranslations("AdminWarehouses.header");

  const breadcrumbs = (
    <AdminBreadcrumbs
      items={[
        { label: tNav("overview"), href: "/" },
        { label: tHeader("title"), href: "/warehouses" },
        { label: tForm("editTitle") },
      ]}
    />
  );

  return (
    <>
      <WarehouseHeader
        title={tForm("editTitle")}
        description={tForm("editDescription")}
        showAddButton={false}
      />
      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <WarehouseForm initialData={warehouse} breadcrumbs={breadcrumbs} />
      </div>
    </>
  );
}
