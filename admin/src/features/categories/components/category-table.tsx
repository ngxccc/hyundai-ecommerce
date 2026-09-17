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
import { deleteCategoryAction } from "../actions/category.actions";
import type { AdminCategory } from "@/types/api";

interface CategoryTableProps {
  categories: AdminCategory[];
  allCategories?: AdminCategory[];
}

export function CategoryTable({
  categories,
  allCategories = [],
}: CategoryTableProps) {
  const t = useTranslations("adminCategories");
  const cardT = useTranslations("adminCategories.card");
  const tableT = useTranslations("adminCategoryTable");
  const formT = useTranslations("adminCategoryForm");

  const parentMap = new Map(allCategories.map((c) => [c.id, c.name]));

  if (categories.length === 0) {
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
              {formT("fields.parentId")}
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
          {categories.map((category) => {
            const parentName = category.parentId
              ? parentMap.get(category.parentId)
              : undefined;
            const status = category.isActive ? "active" : "inactive";

            return (
              <TableRow key={category.id} className="hover:bg-muted/30">
                <TableCell className="text-foreground font-medium">
                  <Link
                    href={`/categories/${category.id}/edit`}
                    className="hover:text-primary hover:underline"
                  >
                    {category.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {category.slug}
                </TableCell>
                <TableCell>
                  {parentName ? (
                    <Badge
                      variant="secondary"
                      className="text-muted-foreground text-xs font-normal"
                    >
                      ↳ {parentName}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/60 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[280px] truncate text-xs">
                  {category.description ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      category.isActive
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
                      <Link href={`/categories/${category.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <EntityDeleteButton
                      entityId={category.id}
                      onDelete={deleteCategoryAction}
                      dialogTitle={t("dialogs.delete.title")}
                      dialogDescription={t("dialogs.delete.description", {
                        categoryName: category.name,
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
