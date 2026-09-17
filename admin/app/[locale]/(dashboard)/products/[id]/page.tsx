import { redirect } from "@/i18n/routing";
import type { Locale } from "next-intl";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  redirect({
    href: `/products/${id}/edit`,
    locale: locale as Locale,
  });
}
