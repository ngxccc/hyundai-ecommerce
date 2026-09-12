import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";

export const warehouseResponseSchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  nameEn: z.string().nullable(),
  streetAddress: z.string(),
  district: z.string(),
  city: z.string(),
  isActive: z.boolean(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export type WarehouseResponseDtoType = z.infer<typeof warehouseResponseSchema>;

export class WarehouseResponseDto extends createZodDto(
  warehouseResponseSchema,
) {}
