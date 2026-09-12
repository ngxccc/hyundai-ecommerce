import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";
import {
  CANOPY_TYPES,
  FUEL_TYPES,
  POWER_PHASES,
  PRODUCT_TYPES,
  START_METHODS,
  UPS_BATTERY_TYPES,
  UPS_TOPOLOGIES,
} from "@/types/product-spec.type";
import {
  jsonContentSchema,
  productSpecSheetSchema,
  productSpecsSchema,
  productTranslationResponseSchema,
} from "./create-product.dto";
import { brandResponseSchema } from "./brand-response.dto";
import { categoryResponseSchema } from "./category-response.dto";

export const productResponseSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  price: z.string(),
  isQuoteOnly: z.boolean(),
  name: z.string(),
  shortDescription: z.string().nullable(),
  description: jsonContentSchema.nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  translations: z.array(productTranslationResponseSchema).optional(),
  nameVi: z.string().optional(),
  nameEn: z.string().nullable().optional(),
  descriptionVi: jsonContentSchema.nullable().optional(),
  descriptionEn: jsonContentSchema.nullable().optional(),
  shortDescriptionVi: z.string().nullable().optional(),
  shortDescriptionEn: z.string().nullable().optional(),
  images: z.array(z.string()),
  brandId: z.uuid().nullable(),
  categoryId: z.uuid().nullable(),
  productType: z.enum(PRODUCT_TYPES),
  powerKva: z.string().nullable(),
  powerKw: z.string().nullable(),
  standbyPowerKva: z.string().nullable(),
  standbyPowerKw: z.string().nullable(),
  phase: z.enum(POWER_PHASES).nullable(),
  voltage: z.string().nullable(),
  frequency: z.number().nullable(),
  fuelType: z.enum(FUEL_TYPES).nullable(),
  canopyType: z.enum(CANOPY_TYPES).nullable(),
  startMethod: z.enum(START_METHODS).nullable(),
  engineBrand: z.string().nullable(),
  alternatorBrand: z.string().nullable(),
  upsTopology: z.enum(UPS_TOPOLOGIES).nullable(),
  upsBatteryType: z.enum(UPS_BATTERY_TYPES).nullable(),
  specSheet: productSpecSheetSchema,
  specs: productSpecsSchema,
  totalStockCache: z.number(),
  totalSalesCache: z.number(),
  isActive: z.boolean(),
  createdAt: zDate(),
  updatedAt: zDate(),
  brand: brandResponseSchema.nullable().optional(),
  category: categoryResponseSchema.nullable().optional(),
});

export type ProductResponseDtoType = z.infer<typeof productResponseSchema>;

export class ProductResponseDto extends createZodDto(productResponseSchema) {}
