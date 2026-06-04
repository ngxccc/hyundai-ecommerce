import { z } from "zod";
import { orderStatusEnum } from "../schemas/order.schema";

export const updateOrderStatusSchema = z
  .object({
    orderId: z.uuid(),
    status: z.enum(orderStatusEnum.enumValues),
  })
  .strict();

export const selectShippingBidSchema = z
  .object({
    orderId: z.uuid(),
    bidId: z.uuid(),
  })
  .strict();

export const addShippingBidSchema = z
  .object({
    orderId: z.uuid("validation.invalidId"),
    vendorName: z.string().min(1, "shippingBidsVendorNameRequired"),
    quotedPrice: z
      .string()
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "shippingBidsQuotedPriceRequired",
      }),
    internalNote: z.string().optional(),
  })
  .strict();

export type TUpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type TSelectShippingBidInput = z.infer<typeof selectShippingBidSchema>;
export type TAddShippingBidInput = z.infer<typeof addShippingBidSchema>;
