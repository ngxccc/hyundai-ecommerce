import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { createCategoryBaseSchema } from "./create-category.dto";

export const updateCategorySchema = createCategoryBaseSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateCategoryDtoType = z.infer<typeof updateCategorySchema>;

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {
  public static readonly zodSchema = updateCategorySchema;
}
