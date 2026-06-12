import { z } from "zod";

export const createWarehouseSchema = z
  .object({
    nameVi: z.string().min(1, "validation.nameRequired"),
    nameEn: z.string().optional().or(z.literal("")).nullable(),
    streetAddress: z.string().min(1, "validation.streetAddressRequired"),
    district: z.string().min(1, "validation.districtRequired"),
    city: z.string().min(1, "validation.cityRequired"),
    isActive: z.boolean().default(true),
  })
  .strict();

export const updateWarehouseSchema = createWarehouseSchema
  .partial()
  .extend({
    id: z.uuid("validation.invalidId"),
  })
  .strict();

export type TCreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type TUpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
