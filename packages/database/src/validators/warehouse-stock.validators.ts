import { z } from "zod";

export const updateWarehouseStockSchema = z
  .object({
    warehouseId: z.uuid(),
    productId: z.uuid(),
    stock: z.number().int().min(0),
    minStockWarning: z.number().int().min(0),
  })
  .strict();

export type TUpdateWarehouseStockInput = z.infer<
  typeof updateWarehouseStockSchema
>;
