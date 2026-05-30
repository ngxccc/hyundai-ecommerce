"use client";

import { useTranslations } from "next-intl";
import { type TBrand } from "@nhatnang/database/schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import { Badge } from "@nhatnang/ui/components/ui/badge";

interface BrandTableProps {
  brands: TBrand[];
}

export const BrandTable = ({ brands }: BrandTableProps) => {
  const t = useTranslations("AdminBrandTable");

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columns.name")}</TableHead>
            <TableHead>{t("columns.slug")}</TableHead>
            <TableHead>{t("columns.status")}</TableHead>
            <TableHead className="text-right">{t("columns.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {t("empty")}
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>{brand.slug}</TableCell>
                <TableCell>
                  <Badge variant={brand.isActive ? "default" : "secondary"}>
                    {brand.isActive ? t("status.active") : t("status.inactive")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/brands/${brand.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
