import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { createWarehouseSchema } from "./create-warehouse.dto";

export const updateWarehouseSchema = createWarehouseSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateWarehouseDtoType = z.infer<typeof updateWarehouseSchema>;

export class UpdateWarehouseDto extends createZodDto(updateWarehouseSchema) {
  public static readonly zodSchema = updateWarehouseSchema;
}
