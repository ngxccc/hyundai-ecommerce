"use client";

import { useTranslations } from "next-intl";
import { Edit, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { AdminWarehouse } from "@/types/api";
import { EntityDeleteButton } from "@/components/common";
import { deleteWarehouseAction } from "../actions/warehouse.actions";
import { cn } from "cn";

export const WarehouseCard = ({ warehouse }: { warehouse: AdminWarehouse }) => {
  const t = useTranslations("adminWarehouses");
  const cardT = useTranslations("adminWarehouses.card");

  const status = warehouse.isActive ? "active" : "inactive";

  return (
    <Card
      size="compact"
      className="group relative px-4 py-2 transition-shadow hover:shadow-md"
    >
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="outline"
          className={cn(
            "bg-background/90 px-2.5 py-0.5 text-xs font-medium shadow-2xs backdrop-blur-xs",
            status === "active"
              ? "border-border text-foreground"
              : "border-destructive/40 text-destructive",
          )}
        >
          {cardT(`status.${status}`)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-2">
        <h3 className="text-primary line-clamp-2 pr-20 text-lg font-semibold">
          {warehouse.nameVi}
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
                title={cardT("actions.edit")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <EntityDeleteButton
              entityId={warehouse.id}
              onDelete={deleteWarehouseAction}
              dialogTitle={t("dialogs.delete.title")}
              dialogDescription={t("dialogs.delete.description", {
                warehouseName: warehouse.nameVi,
              })}
              successMessage={t("messages.deleteSuccess")}
              errorMessage={t("messages.deleteError")}
              cancelLabel={t("dialogs.delete.cancel")}
              confirmLabel={t("dialogs.delete.confirm")}
              deletingLabel={t("dialogs.delete.deleting")}
              buttonTooltip={cardT("actions.delete")}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
