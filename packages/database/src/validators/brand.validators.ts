import { z } from "zod";

export const createBrandSchema = z
  .object({
    name: z.string().min(1, "validation.nameRequired"),
    slug: z.string().min(1, "validation.slugRequired"),
    logo: z.url("validation.invalidUrl").optional().or(z.literal("")).nullable(),
    descriptionVi: z.string().optional().or(z.literal("")).nullable(),
    descriptionEn: z.string().optional().or(z.literal("")).nullable(),
    isActive: z.boolean().default(true),
  })
  .strict();

export const updateBrandSchema = createBrandSchema
  .partial()
  .extend({
    id: z.uuid("validation.invalidId"),
  })
  .strict();

export type TCreateBrandInput = z.infer<typeof createBrandSchema>;
export type TUpdateBrandInput = z.infer<typeof updateBrandSchema>;
