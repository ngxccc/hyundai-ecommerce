import { BrandHeader } from "@/features/brands/components";
import { BrandForm } from "@/features/brands/components/brand-form";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import type { Metadata } from "next";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "adminBrandForm",
  });

  return {
    title: t("title"),
  };
}

export default async function AdminNewBrandPage() {
  const tNav = await getTranslations("adminDashboard.nav");
  const tForm = await getTranslations("adminBrandForm");

  return (
    <>
      <BrandHeader
        title={tForm("title")}
        description={tForm("description")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <BrandForm
          breadcrumbs={
            <AdminBreadcrumbs
              items={[
                { label: tNav("overview"), href: "/" },
                { label: tNav("brands"), href: "/brands" },
                { label: tForm("title") },
              ]}
            />
          }
        />
      </div>
    </>
  );
}
