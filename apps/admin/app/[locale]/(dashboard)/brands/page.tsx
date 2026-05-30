import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { BrandTable } from "@/features/brands/components/brand-table";
import { brandService } from "@nhatnang/database/services";
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
    title: t("brands"),
  };
}

export default async function AdminBrandsPage() {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminBrands.header");
  const brands = await brandService.getAll();

  return (
    <>
      <BrandHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={true}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("brands") },
          ]}
        />
        <BrandTable brands={brands} />
      </div>
    </>
  );
}
