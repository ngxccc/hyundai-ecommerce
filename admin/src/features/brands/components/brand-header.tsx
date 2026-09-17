"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface BrandHeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
}

export const BrandHeader = ({
  title,
  description,
  showAddButton = true,
}: BrandHeaderProps) => {
  const t = useTranslations("adminBrands.header");

  return (
    <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {showAddButton && (
        <Button asChild variant="default" className="gap-2 shadow-xs">
          <Link href="/brands/new">
            <Plus className="size-4" />
            <span>{t("addBrand")}</span>
          </Link>
        </Button>
      )}
    </div>
  );
};
