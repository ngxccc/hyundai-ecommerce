"use client";

import { WarehouseCard } from "./warehouse-card";
import type { WarehouseDTO } from "@/shared/types/admin-schema.types";

interface WarehouseGridProps {
  warehouses: WarehouseDTO[];
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
