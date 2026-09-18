"use client";

import { useTranslations } from "next-intl";
import { Edit, MapPin } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EntityDeleteButton } from "@/components/common";
import { deleteWarehouseAction } from "../actions/warehouse.actions";
import type { AdminWarehouse } from "@/types/api";

interface WarehouseTableProps {
  warehouses: AdminWarehouse[];
}

export function WarehouseTable({ warehouses }: WarehouseTableProps) {
  const t = useTranslations("adminWarehouses");
  const cardT = useTranslations("adminWarehouses.card");
  const formT = useTranslations("adminWarehouseForm");

  if (warehouses.length === 0) {
    return (
      <Card className="border-border/60 flex min-h-[220px] flex-col items-center justify-center rounded-xl p-8 text-center shadow-xs">
        <p className="text-muted-foreground text-sm">
          {t("header.description")}
        </p>
      </Card>
    );
  }

  return (
    <Card size="dense" className="overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-semibold">
              {formT("fields.name")}
            </TableHead>
            <TableHead className="font-semibold">
              {formT("fields.streetAddress")}
            </TableHead>
            <TableHead className="font-semibold">
              {formT("fields.district")}
            </TableHead>
            <TableHead className="font-semibold">
              {formT("fields.city")}
            </TableHead>
            <TableHead className="text-center font-semibold">
              {formT("fields.isActive")}
            </TableHead>
            <TableHead className="w-[100px] text-right font-semibold">
              {cardT("actions.edit")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => {
            const status = warehouse.isActive ? "active" : "inactive";

            return (
              <TableRow key={warehouse.id} className="hover:bg-muted/30">
                <TableCell className="text-foreground font-medium">
                  <Link
                    href={`/warehouses/${warehouse.id}/edit`}
                    className="hover:text-primary hover:underline"
                  >
                    {warehouse.nameVi}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="text-muted-foreground/70 size-3.5 shrink-0" />
                    <span>{warehouse.streetAddress}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {warehouse.district}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {warehouse.city}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      warehouse.isActive
                        ? "border-border text-foreground text-xs"
                        : "border-destructive/40 text-destructive text-xs"
                    }
                  >
                    {cardT(`status.${status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-8"
                      title={cardT("actions.edit")}
                    >
                      <Link href={`/warehouses/${warehouse.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
