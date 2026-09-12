import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";

export const categoryTranslationResponseSchema = z.object({
  locale: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

const baseCategoryResponseSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  parentId: z.uuid().nullable(),
  image: z.string().nullable(),
  isActive: z.boolean(),
  name: z.string(),
  description: z.string().nullable(),
  translations: z.array(categoryTranslationResponseSchema).optional(),
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
