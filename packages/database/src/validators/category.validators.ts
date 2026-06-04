import { z } from "zod";

export const createCategorySchema = z
  .object({
    name: z.string().min(1, "validation.nameRequired"),
    slug: z.string().min(1, "validation.slugRequired"),
    parentId: z.uuid("validation.invalidParent").nullish(),
    description: z.string().optional().or(z.literal("")).nullable(),
    image: z.url("validation.invalidUrl").optional().or(z.literal("")).nullable(),
    isActive: z.boolean().default(true),
  })
  .strict();

export const updateCategorySchema = createCategorySchema
  .partial()
  .extend({
    id: z.uuid("validation.invalidId"),
  })
  .strict();

export type TCreateCategoryInput = z.infer<typeof createCategorySchema>;
export type TUpdateCategoryInput = z.infer<typeof updateCategorySchema>;
