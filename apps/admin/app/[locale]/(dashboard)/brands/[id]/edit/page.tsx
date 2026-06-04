import { BrandHeader } from "@/features/brands/components";
import { BrandForm } from "@/features/brands/components/brand-form";
import { brandService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "AdminBrandForm",
  });

  return {
    title: t("editTitle"),
  };
}

export default async function AdminEditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tNav = await getTranslations("AdminDashboard.nav");
  const tForm = await getTranslations("AdminBrandForm");

  const brand = await brandService.getById(id);

  if (!brand) {
    notFound();
  }

  return (
    <>
      <BrandHeader
        title={tForm("editTitle")}
        description={tForm("editDescription")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <BrandForm
          initialData={brand}
          breadcrumbs={
            <AdminBreadcrumbs
              items={[
                { label: tNav("overview"), href: "/" },
                { label: tNav("brands"), href: "/brands" },
                { label: tForm("editTitle") },
              ]}
            />
          }
        />
      </div>
    </>
  );
}
