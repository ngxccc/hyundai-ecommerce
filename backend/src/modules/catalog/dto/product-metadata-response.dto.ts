import { z } from "zod";
import { createZodDto } from "@/common/dto";

export const brandFacetItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  count: z.number(),
});

export const categoryFacetItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  nameVi: z.string().optional(),
  nameEn: z.string().nullable().optional(),
  count: z.number(),
});

export const rangeFacetSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const valueCountFacetItemSchema = z.object({
  value: z.string(),
  count: z.number(),
});

export const productMetadataResponseSchema = z.object({
  brands: z.array(brandFacetItemSchema),
  categories: z.array(categoryFacetItemSchema),
  powerRange: rangeFacetSchema,
  priceRange: rangeFacetSchema,
  fuelTypes: z.array(valueCountFacetItemSchema),
  phases: z.array(valueCountFacetItemSchema),
  canopyTypes: z.array(valueCountFacetItemSchema),
});

export type BrandFacetItemDtoType = z.infer<typeof brandFacetItemSchema>;
export type CategoryFacetItemDtoType = z.infer<typeof categoryFacetItemSchema>;
export type RangeFacetDtoType = z.infer<typeof rangeFacetSchema>;
export type ValueCountFacetItemDtoType = z.infer<
  typeof valueCountFacetItemSchema
>;
export type ProductMetadataResponseDtoType = z.infer<
  typeof productMetadataResponseSchema
>;

export class BrandFacetItem extends createZodDto(brandFacetItemSchema) {}
export class CategoryFacetItem extends createZodDto(categoryFacetItemSchema) {}
export class RangeFacet extends createZodDto(rangeFacetSchema) {}
export class ValueCountFacetItem extends createZodDto(
  valueCountFacetItemSchema,
) {}
export class ProductMetadataResponseDto extends createZodDto(
  productMetadataResponseSchema,
) {}
