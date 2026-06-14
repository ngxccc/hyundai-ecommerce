import type { Metadata } from "next";
import { CartTemplate } from "@/features/cart/components/cart-template";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { getTranslations } = await import("next-intl/server");
  const t = await getTranslations({ locale: locale as "vi" | "en", namespace: "Metadata" });
  return {
    title: `${t("cartTitle")} | Hyundai B2B Storefront`,
    description: t("cartDescription"),
  };
}

export default function CartPage() {
  return <CartTemplate />;
}
