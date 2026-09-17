"use client";

import { useTranslations } from "next-intl";
import { Edit } from "lucide-react";
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
import { deleteBrandAction } from "../actions/brand.actions";
import type { AdminBrand } from "@/types/api";

interface BrandTableProps {
  brands: AdminBrand[];
}

export function BrandTable({ brands }: BrandTableProps) {
  const t = useTranslations("adminBrands");
  const cardT = useTranslations("adminBrands.card");
  const tableT = useTranslations("adminBrandTable");
  const formT = useTranslations("adminBrandForm");

  if (brands.length === 0) {
    return (
      <Card className="border-border/60 flex min-h-[220px] flex-col items-center justify-center rounded-xl p-8 text-center shadow-xs">
        <p className="text-muted-foreground text-sm">{tableT("empty")}</p>
      </Card>
    );
  }

  return (
    <Card size="dense" className="overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-semibold">
              {tableT("columns.name")}
            </TableHead>
            <TableHead className="font-semibold">
              {tableT("columns.slug")}
            </TableHead>
            <TableHead className="font-semibold">
              {formT("fields.description")}
            </TableHead>
            <TableHead className="text-center font-semibold">
              {tableT("columns.status")}
            </TableHead>
            <TableHead className="w-[100px] text-right font-semibold">
              {tableT("columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => {
            const status = brand.isActive ? "active" : "inactive";

            return (
              <TableRow key={brand.id} className="hover:bg-muted/30">
                <TableCell className="text-foreground font-medium">
                  <Link
                    href={`/brands/${brand.id}/edit`}
                    className="hover:text-primary hover:underline"
                  >
                    {brand.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {brand.slug}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[340px] truncate text-xs">
                  {brand.description ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      brand.isActive
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
                      <Link href={`/brands/${brand.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <EntityDeleteButton
                      entityId={brand.id}
                      onDelete={deleteBrandAction}
                      dialogTitle={t("dialogs.delete.title")}
                      dialogDescription={t("dialogs.delete.description", {
                        brandName: brand.name,
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
