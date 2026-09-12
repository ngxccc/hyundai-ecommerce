import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";
import { cartItemResponseSchema } from "./cart-item-response.dto";

export const cartSummarySchema = z.object({
  totalItems: z.number(),
  totalAmount: z.string(),
});

export const cartResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  items: z.array(cartItemResponseSchema),
  summary: cartSummarySchema,
  createdAt: zDate(),
  updatedAt: zDate(),
});

export type CartSummaryDtoType = z.infer<typeof cartSummarySchema>;
export type CartResponseDtoType = z.infer<typeof cartResponseSchema>;

export class CartSummaryDto extends createZodDto(cartSummarySchema) {}

export class CartResponseDto extends createZodDto(cartResponseSchema) {}
