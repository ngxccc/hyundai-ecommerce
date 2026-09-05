import {
  CustomerHeader,
  CustomerDirectory,
} from "@/features/customers/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { api } from "@/lib/api-client";
import type { AdminUser } from "@/types/api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
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
  const t = await getTranslations({ locale, namespace: "AdminCustomers" });

  return {
    title: t("title"),
  };
}

export default async function AdminCustomersPage() {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tCustomers = await getTranslations("AdminCustomers");

  const users: AdminUser[] = [];
  const { data: tierRes } = await api.GET("/dealer-tiers");
  const dealerTiers = tierRes?.data ?? [];

  return (
    <>
      <CustomerHeader
        title={tCustomers("title")}
        description={tCustomers("description")}
      />

      <div className="mx-auto flex w-full flex-col gap-4 p-4">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("customers") },
          ]}
        />
        <CustomerDirectory initialUsers={users} dealerTiers={dealerTiers} />
      </div>
    </>
  );
}
