import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import { formatShippingAddress } from "@nhatnang/shared/lib/utils";
import { SectionCard } from "./section-card";

interface ShippingAddressCardProps {
  shippingAddress: ComplexOrder["shippingAddress"];
}

export function ShippingAddressCard({
  shippingAddress,
}: ShippingAddressCardProps) {
  const t = useTranslations("Orders");

  return (
    <SectionCard
      title={t("labels.shippingAddressLabel")}
      icon={<MapPin className="h-4 w-4 text-zinc-500" />}
      titleClassName="text-sm font-semibold"
      contentClassName="p-5 text-sm leading-relaxed text-zinc-600 whitespace-pre-line"
    >
      {formatShippingAddress(shippingAddress)}
    </SectionCard>
  );
}
