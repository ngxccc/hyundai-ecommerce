import { Suspense } from "react";
import { brandsApi } from "@/features/brands/api/brands.api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { BrandForm } from "@/features/brands/components/brand-form";
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
    namespace: "adminBrandForm",
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
  const [tNav, tForm] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminBrandForm"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("brands"), href: "/brands" },
          { label: tForm("editTitle") },
        ]}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <EditBrandContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditBrandContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const { data: res } = await brandsApi.getById(id);
  const brand = res?.data;

  if (!brand) {
    notFound();
  }

  return <BrandForm initialData={brand} />;
}
