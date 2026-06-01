import {
  CustomerHeader,
  CustomerDirectory,
} from "@/features/customers/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { userService, dealerTierService } from "@nhatnang/database/services";
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
  const t = await getTranslations({ locale, namespace: "AdminCustomers" });

  return {
    title: t("title"),
  };
}

export default async function AdminCustomersPage() {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tCustomers = await getTranslations("AdminCustomers");

  // Fetch users directory and dealer tiers server-side
  const users = await userService.list();
  const dealerTiers = await dealerTierService.getAll();

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
