import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";

const baseCategoryResponseSchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  nameEn: z.string().nullable(),
  slug: z.string(),
  parentId: z.uuid().nullable(),
  descriptionVi: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  image: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export type CategoryResponseDtoType = z.infer<
  typeof baseCategoryResponseSchema
> & {
  children?: CategoryResponseDtoType[];
};

export const categoryResponseSchema: z.ZodType<CategoryResponseDtoType> =
  baseCategoryResponseSchema.extend({
    children: z.lazy(() => categoryResponseSchema.array()).optional(),
  });

export class CategoryResponseDto extends createZodDto(categoryResponseSchema) {}
