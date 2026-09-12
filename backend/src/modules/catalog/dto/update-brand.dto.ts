import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { createBrandBaseSchema } from "./create-brand.dto";

export const updateBrandSchema = createBrandBaseSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateBrandDtoType = z.infer<typeof updateBrandSchema>;

export class UpdateBrandDto extends createZodDto(updateBrandSchema) {
  public static readonly zodSchema = updateBrandSchema;
}
