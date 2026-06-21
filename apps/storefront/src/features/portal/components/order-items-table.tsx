"use client";

import { useTranslations } from "next-intl";
import { SectionCard } from "./section-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import type { ComplexOrder } from "@nhatnang/database/services";
import { priceFormatter } from "@nhatnang/shared/lib/utils";

interface OrderItemsTableProps {
  items: ComplexOrder["items"];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  const t = useTranslations("Orders");

  return (
    <SectionCard
      title={t("labels.productItems")}
      contentClassName="p-0 [&_[data-slot=table-container]]:[scrollbar-width:none] [&_[data-slot=table-container]::-webkit-scrollbar]:hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[45%] pl-6">
              {t("labels.productLabel")}
            </TableHead>
            <TableHead className="text-right">
              {t("labels.unitPriceLabel")}
            </TableHead>
            <TableHead className="text-center">
              {t("labels.qtyLabel")}
            </TableHead>
            <TableHead className="pr-6 text-right">
              {t("labels.subtotalLabel")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const price = parseFloat(item.unitPrice);
            return (
              <TableRow key={item.id}>
                <TableCell className="pl-6 font-medium">
                  <p className="text-zinc-900">{item.productName}</p>
                </TableCell>
                <TableCell className="text-right">
                  {priceFormatter.format(price)}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="pr-6 text-right font-semibold">
                  {priceFormatter.format(price * item.quantity)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
