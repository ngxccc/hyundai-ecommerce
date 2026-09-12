import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";

export const brandResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  descriptionVi: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export type BrandResponseDtoType = z.infer<typeof brandResponseSchema>;

export class BrandResponseDto extends createZodDto(brandResponseSchema) {}
