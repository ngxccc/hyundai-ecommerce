import { Suspense } from "react";
import {
  CustomerHeader,
  DealerTiersTable,
} from "@/features/customers/components";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { customersApi } from "@/features/customers/api/customers.api";
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
  const t = await getTranslations({ locale, namespace: "adminDealerTiers" });

  return {
    title: t("title"),
  };
}

export default async function AdminDealerTiersPage() {
  const [tNav, tTiers] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminDealerTiers"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("customers"), href: "/customers" },
          { label: tNav("dealerTiers") },
        ]}
      />

      <CustomerHeader
        title={tTiers("title")}
        description={tTiers("description")}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <DealerTiersContent />
      </Suspense>
    </div>
  );
}

async function DealerTiersContent() {
  await connection();
  const { data: tierRes } = await customersApi.listTiers();
  const dealerTiers = tierRes?.data ?? [];

  return (
    <div className="flex w-full flex-col gap-4">
      <DealerTiersTable tiers={dealerTiers} />
    </div>
  );
}
