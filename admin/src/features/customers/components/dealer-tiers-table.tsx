"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AdminDealerTier } from "@/types/api";
import { Award, Percent, DollarSign } from "lucide-react";

interface DealerTiersTableProps {
  tiers: AdminDealerTier[];
}

export function DealerTiersTable({ tiers }: DealerTiersTableProps) {
  const t = useTranslations("adminDealerTiers");

  if (tiers.length === 0) {
    return (
      <Card className="border-border/60 flex min-h-[220px] flex-col items-center justify-center rounded-xl p-8 text-center shadow-xs">
        <Award className="text-muted-foreground/50 mb-2 size-8" />
        <p className="text-muted-foreground text-sm">{t("empty")}</p>
      </Card>
    );
  }

  return (
    <Card size="dense" className="overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-semibold">{t("table.name")}</TableHead>
            <TableHead className="font-semibold">
              {t("table.discount")}
            </TableHead>
            <TableHead className="font-semibold">
              {t("table.minSpend")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((tier) => (
            <TableRow key={tier.id} className="hover:bg-muted/30">
              <TableCell className="text-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Award className="text-primary size-4 shrink-0" />
                  <span>{tier.nameVi}</span>
                  {tier.nameEn && (
                    <span className="text-muted-foreground text-xs font-normal">
                      ({tier.nameEn})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="text-primary gap-1 font-mono text-xs font-semibold"
                >
                  <Percent className="size-3" />
                  <span>{tier.discountPercentage}%</span>
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs font-medium">
                <div className="flex items-center gap-1">
                  <DollarSign className="text-muted-foreground/70 size-3.5" />
                  <span>{formatCurrency(Number(tier.minimumSpend))}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
