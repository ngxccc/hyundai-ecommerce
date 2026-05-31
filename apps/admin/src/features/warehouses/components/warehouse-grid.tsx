"use client";

import { WarehouseCard } from "./warehouse-card";
import type { TWarehouse } from "@nhatnang/database/schemas";

interface WarehouseGridProps {
  warehouses: TWarehouse[];
}

export const WarehouseGrid = ({ warehouses }: WarehouseGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {warehouses.map((warehouse) => (
        <WarehouseCard key={warehouse.id} warehouse={warehouse} />
      ))}
    </div>
  );
};
