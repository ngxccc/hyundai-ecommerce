"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Save, AlertCircle } from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import { setProductStockAction } from "../actions/inventory.actions";
import type { TWarehouse, TWarehouseStock } from "@nhatnang/database/schemas";
import { Badge } from "@nhatnang/ui/components/ui/badge";

interface ProductInventoryTableProps {
  productId: string;
  warehouses: TWarehouse[];
  warehouseStocks: TWarehouseStock[];
}

export const ProductInventoryTable = ({
  productId,
  warehouses,
  warehouseStocks,
}: ProductInventoryTableProps) => {
  const t = useTranslations("AdminInventory");

  // Sort warehouses so active ones are first
  const sortedWarehouses = [...warehouses].sort((a, b) => {
    if (a.isActive === b.isActive) return a.nameVi.localeCompare(b.nameVi);
    return a.isActive ? -1 : 1;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.warehouse")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="w-37.5">{t("table.stock")}</TableHead>
            <TableHead className="w-45">{t("table.minStock")}</TableHead>
            <TableHead className="w-25 text-right">
              {t("table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedWarehouses.map((warehouse) => {
            const currentStock = warehouseStocks.find(
              (s) => s.warehouseId === warehouse.id,
            );
            return (
              <InventoryRow
                key={warehouse.id}
                warehouse={warehouse}
                productId={productId}
                initialStock={currentStock?.stock ?? 0}
                initialMinStock={currentStock?.minStockWarning ?? 2}
              />
            );
          })}

          {sortedWarehouses.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const InventoryRow = ({
  warehouse,
  productId,
  initialStock,
  initialMinStock,
}: {
  warehouse: TWarehouse;
  productId: string;
  initialStock: number;
  initialMinStock: number;
}) => {
  const t = useTranslations("AdminInventory");
  const [stock, setStock] = useState(initialStock.toString());
  const [minStock, setMinStock] = useState(initialMinStock.toString());
  const [isPending, startTransition] = useTransition();

  const stockVal = parseInt(stock);
  const minStockVal = parseInt(minStock);

  const isChanged =
    stock !== initialStock.toString() ||
    minStock !== initialMinStock.toString();

  const isOutOfStock = stockVal === 0;
  const isLowStock = stockVal > 0 && stockVal <= minStockVal;

  const handleSave = () => {
    if (isNaN(stockVal) || stockVal < 0) {
      toast.error(t("errors.invalidStock"));
      return;
    }
    if (isNaN(minStockVal) || minStockVal < 0) {
      toast.error(t("errors.invalidMinStockWarning"));
      return;
    }

    startTransition(async () => {
      const result = await setProductStockAction({
        productId,
        warehouseId: warehouse.id,
        stock: stockVal,
        minStockWarning: minStockVal,
      });

      if (result.success) {
        toast.success(t("messages.successSave"));
      } else {
        toast.error(result.error ?? t("messages.errorSave"));
      }
    });
  };

  return (
    <TableRow className={!warehouse.isActive ? "bg-muted/50 opacity-60" : ""}>
      <TableCell className="font-medium">
        {warehouse.nameVi}
        {!warehouse.isActive && (
          <span className="text-muted-foreground ml-2 text-xs">
            ({t("status.inactive")})
          </span>
        )}
      </TableCell>
      <TableCell>
        {!warehouse.isActive ? (
          <Badge variant="secondary" className="text-muted-foreground">
            {t("status.inactive")}
          </Badge>
        ) : isOutOfStock ? (
          <Badge
            variant="destructive"
            className="gap-1 bg-red-500 hover:bg-red-600"
          >
            <AlertCircle className="h-3 w-3" />
            {t("status.outOfStock")}
          </Badge>
        ) : isLowStock ? (
          <Badge
            variant="destructive"
            className="gap-1 bg-orange-500 hover:bg-orange-600"
          >
            <AlertCircle className="h-3 w-3" />
            {t("status.lowStock")}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
          >
            {t("status.inStock")}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          disabled={!warehouse.isActive || isPending}
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          disabled={!warehouse.isActive || isPending}
          className="w-24"
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant={isChanged ? "default" : "outline"}
          disabled={!isChanged || !warehouse.isActive || isPending}
          onClick={handleSave}
        >
          {isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("buttons.save")}
            </>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};
