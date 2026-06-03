import { z } from "zod";
import { orderStatusEnum } from "../schemas/order.schema";

export const updateOrderStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(orderStatusEnum.enumValues),
});

export type TUpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const selectShippingBidSchema = z.object({
  orderId: z.uuid(),
  bidId: z.uuid(),
});

export type TSelectShippingBidInput = z.infer<typeof selectShippingBidSchema>;

export const addShippingBidSchema = z.object({
  orderId: z.uuid(),
  vendorName: z.string().min(1, "shippingBidsVendorNameRequired"),
  quotedPrice: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "shippingBidsQuotedPriceRequired",
    }),
  internalNote: z.string().optional(),
});

export type TAddShippingBidInput = z.infer<typeof addShippingBidSchema>;
