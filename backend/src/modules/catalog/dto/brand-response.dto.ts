import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";

export const brandTranslationResponseSchema = z.object({
  locale: z.string(),
  description: z.string().nullable(),
});

export const brandResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  description: z.string().nullable(),
  translations: z.array(brandTranslationResponseSchema).optional(),
  descriptionVi: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export type BrandResponseDtoType = z.infer<typeof brandResponseSchema>;

export class BrandResponseDto extends createZodDto(brandResponseSchema) {}
