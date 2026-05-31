import { AdminBreadcrumbs } from "@/features/dashboard/components";
import {
  WarehouseForm,
  WarehouseHeader,
} from "@/features/warehouses/components";
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
  const t = await getTranslations({ locale, namespace: "AdminWarehouseForm" });

  return {
    title: t("title"),
  };
}

export default async function NewWarehousePage() {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tForm = await getTranslations("AdminWarehouseForm");
  const tHeader = await getTranslations("AdminWarehouses.header");

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
