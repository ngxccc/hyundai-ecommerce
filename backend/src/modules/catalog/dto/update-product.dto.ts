import { z } from "zod";
import { createZodDto } from "@/common/dto";
import {
  createProductSchema,
  productSpecSheetSchema,
  baseProductSpecsSchema,
} from "./create-product.dto";
import { PRODUCT_TYPES } from "@/types/product-spec.type";
import { zSanitizedString } from "@/common/schemas/zod-primitives";

export const updateProductSchema = createProductSchema
  .partial()
  .extend({
    price: z.number().min(0).optional(),
    images: z.array(zSanitizedString({ max: 500 })).optional(),
    productType: z.enum(PRODUCT_TYPES).optional(),
    frequency: z.number().int().positive().optional(),
    specSheet: productSpecSheetSchema.optional(),
    specs: baseProductSpecsSchema.optional(),
    totalStockCache: z.number().int().min(0).optional(),
    isQuoteOnly: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateProductDtoType = z.infer<typeof updateProductSchema>;

export class UpdateProductDto extends createZodDto(updateProductSchema) {
  public static readonly zodSchema = updateProductSchema;
}
