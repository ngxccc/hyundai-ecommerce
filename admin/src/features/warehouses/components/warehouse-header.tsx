"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface WarehouseHeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
}

export const WarehouseHeader = ({
  title,
  description,
  showAddButton = true,
}: WarehouseHeaderProps) => {
  const t = useTranslations("adminWarehouses.header");

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
          <Link href="/warehouses/new">
            <Plus className="size-4" />
            <span>{t("addWarehouse")}</span>
          </Link>
        </Button>
      )}
    </div>
  );
};
