import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";

export const stockProductItemSchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  slug: z.string(),
  totalStockCache: z.number(),
});

export const stockWarehouseItemSchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  city: z.string(),
});

export const warehouseStockResponseSchema = z.object({
  warehouseId: z.uuid(),
  productId: z.uuid(),
  stock: z.number(),
  minStockWarning: z.number(),
  createdAt: zDate(),
  updatedAt: zDate(),
  product: stockProductItemSchema.nullable().optional(),
  warehouse: stockWarehouseItemSchema.nullable().optional(),
});

export type StockProductItemDtoType = z.infer<typeof stockProductItemSchema>;
export type StockWarehouseItemDtoType = z.infer<
  typeof stockWarehouseItemSchema
>;
export type WarehouseStockResponseDtoType = z.infer<
  typeof warehouseStockResponseSchema
>;

export class StockProductItemDto extends createZodDto(stockProductItemSchema) {}
export class StockWarehouseItemDto extends createZodDto(
  stockWarehouseItemSchema,
) {}
export class WarehouseStockResponseDto extends createZodDto(
  warehouseStockResponseSchema,
) {}
