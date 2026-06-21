import { useTranslations } from "next-intl";
import { User, Building } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import { SectionCard } from "./section-card";

interface BuyerInfoCardProps {
  user: ComplexOrder["user"];
  isB2B: boolean;
}

export function BuyerInfoCard({ user, isB2B }: BuyerInfoCardProps) {
  const t = useTranslations("Orders");

  return (
    <SectionCard
      title={t("labels.buyerInfoLabel")}
      icon={
        isB2B ? (
          <Building className="h-4 w-4 text-zinc-500" />
        ) : (
          <User className="h-4 w-4 text-zinc-500" />
        )
      }
      titleClassName="text-sm font-semibold"
      contentClassName="p-5 text-sm text-zinc-600"
    >
      <p className="font-semibold text-zinc-900">{user.name}</p>
      <p className="mt-1">{user.email}</p>
      {isB2B && user.companyName && (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            {t("labels.b2bEnterpriseLabel")}
          </p>
          <p className="mt-1 font-medium text-zinc-900">{user.companyName}</p>
          {user.taxId && <p className="mt-0.5 text-xs">MST: {user.taxId}</p>}
        </div>
      )}
    </SectionCard>
  );
}
