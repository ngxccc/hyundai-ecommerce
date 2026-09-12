import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";

export const cartProductSummarySchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  nameEn: z.string().nullable(),
  slug: z.string(),
  price: z.string(),
  images: z.array(z.string()),
  totalStockCache: z.number(),
  isActive: z.boolean(),
  isOutOfStock: z.boolean(),
});

export const cartItemResponseSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  quantity: z.number(),
  lineTotal: z.string(),
  product: cartProductSummarySchema,
  createdAt: zDate(),
  updatedAt: zDate(),
});

export type CartProductSummaryDtoType = z.infer<
  typeof cartProductSummarySchema
>;
export type CartItemResponseDtoType = z.infer<typeof cartItemResponseSchema>;

export class CartProductSummaryDto extends createZodDto(
  cartProductSummarySchema,
) {}

export class CartItemResponseDto extends createZodDto(cartItemResponseSchema) {}
