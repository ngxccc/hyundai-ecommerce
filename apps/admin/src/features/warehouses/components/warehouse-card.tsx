"use client";

import { useTranslations } from "next-intl";
import { Edit, MapPin } from "lucide-react";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Link } from "@/i18n/routing";
import type { TWarehouse } from "@nhatnang/database/schemas";

import { DeleteWarehouseButton } from "./delete-warehouse-button";

export const WarehouseCard = ({ warehouse }: { warehouse: TWarehouse }) => {
  const t = useTranslations("AdminWarehouses.card");

  const status = warehouse.isActive ? "active" : "inactive";

  return (
    <Card className="group relative flex flex-col gap-0 px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="secondary"
          className={`border-transparent font-medium ${
            status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {t(`status.${status}`)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-2">
        <h3 className="text-primary line-clamp-2 pr-20 text-lg font-semibold">
          {warehouse.name}
        </h3>

        <div className="text-muted-foreground mt-2 flex flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {warehouse.streetAddress}, {warehouse.district}, {warehouse.city}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-end justify-end">
          <div className="flex gap-1 opacity-40 transition-opacity sm:group-hover:opacity-100">
            <Link href={`/warehouses/${warehouse.id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 transition-colors"
                title={t("actions.edit")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteWarehouseButton
              warehouseId={warehouse.id}
              warehouseName={warehouse.name}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
