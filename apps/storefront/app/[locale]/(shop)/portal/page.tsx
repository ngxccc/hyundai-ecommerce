import { redirect } from "@/i18n/routing";
import type { Locale } from "next-intl";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect({
    href: "/portal/profile",
    locale,
  });
}
