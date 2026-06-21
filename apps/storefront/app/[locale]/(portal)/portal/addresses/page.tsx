import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { getCachedSession } from "@/shared/lib/session";
import { addressService } from "@nhatnang/database/services";
import { AddressList } from "@/features/portal/components/address-list";
import { redirect } from "@/i18n/routing";
import { cacheLife, cacheTag } from "next/cache";

async function getCachedAddresses(userId: string) {
  "use cache: private";
  cacheLife("days");
  cacheTag(`user-addresses-${userId}`);
  return await addressService.getByUserId(userId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "Portal.addresses" });
  return { title: `${t("title")} | Hyundai B2B Storefront` };
}

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;

  const session = await getCachedSession();
  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/addresses")}`,
      locale,
    });
  }

  // Fetch addresses using service layer
  const addresses = await getCachedAddresses(session!.user.id);

  return (
    <div className="space-y-6">
      <AddressList initialAddresses={addresses} />
    </div>
  );
}
