import { Suspense } from "react";
import {
  CustomerHeader,
  CustomerDirectory,
} from "@/features/customers/components";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { customersApi } from "@/features/customers/api/customers.api";
import type { AdminUser } from "@/types/api";
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
  const t = await getTranslations({ locale, namespace: "adminCustomers" });

  return {
    title: t("title"),
  };
}

export default async function AdminCustomersPage() {
  const [tNav, tCustomers] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminCustomers"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("customers") },
        ]}
      />

      <CustomerHeader
        title={tCustomers("title")}
        description={tCustomers("description")}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <CustomersContent />
      </Suspense>
    </div>
  );
}

async function CustomersContent() {
  await connection();
  const users: AdminUser[] = [];
  const { data: tierRes } = await customersApi.listTiers();
  const dealerTiers = tierRes?.data ?? [];

  return (
    <div className="flex w-full flex-col gap-4">
      <CustomerDirectory initialUsers={users} dealerTiers={dealerTiers} />
    </div>
  );
}
