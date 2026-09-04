import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Locale } from "next-intl";

// this page will show when url is invalid
export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  notFound();
}
