import {
  CustomerHeader,
  TierConfigurator,
} from "@/features/customers/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { dealerTierService } from "@nhatnang/database/services";
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
  const t = await getTranslations({ locale, namespace: "AdminDealerTiers" });

  return {
    title: t("title"),
  };
}

export default async function AdminDealerTiersPage() {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tTiers = await getTranslations("AdminDealerTiers");

  // Fetch active discount tiers server-side
  const dealerTiers = await dealerTierService.getAll();

  return (
    <>
      <CustomerHeader
        title={tTiers("title")}
        description={tTiers("description")}
      />

      <div className="mx-auto flex w-full flex-col gap-4 p-4">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("customers"), href: "/customers" },
            { label: tNav("dealerTiers") },
          ]}
        />
        <TierConfigurator dealerTiers={dealerTiers} />
      </div>
    </>
  );
}
