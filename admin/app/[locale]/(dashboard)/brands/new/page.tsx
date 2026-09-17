import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import type { Metadata } from "next";
import { BrandForm } from "@/features/brands/components/brand-form";
import { CenteredSpinner } from "@/components/common";

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
          { label: tForm("title") },
        ]}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <BrandForm />
      </Suspense>
    </div>
  );
}
