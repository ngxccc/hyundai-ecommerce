import { z } from "zod";
import { orderStatusEnum } from "../schemas/order.schema";
import { PAYMENT_METHODS } from "@nhatnang/core";
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

export const checkoutRequestSchema = z.object({
  shippingAddress: z.string().min(1, "errors.missingRequiredFields"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: "errors.invalidPaymentMethod",
  }),
  paymentOption: z.enum(["DEPOSIT", "FULL"] as const, {
    message: "errors.invalidPaymentOption",
  }),
  shippingFee: z.number().optional().default(0),
});

export type TCheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
