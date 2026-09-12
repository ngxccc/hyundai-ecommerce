import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";

export const createWarehouseSchema = z
  .object({
    nameVi: zSanitizedString({ min: 1, max: 200 }),
    nameEn: zSanitizedString({ max: 200 }).nullish(),
    streetAddress: zSanitizedString({ min: 1, max: 255 }),
    district: zSanitizedString({ min: 1, max: 100 }),
    city: zSanitizedString({ min: 1, max: 100 }),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateWarehouseDtoType = z.infer<typeof createWarehouseSchema>;

export class CreateWarehouseDto extends createZodDto(createWarehouseSchema) {
  public static readonly zodSchema = createWarehouseSchema;
}
