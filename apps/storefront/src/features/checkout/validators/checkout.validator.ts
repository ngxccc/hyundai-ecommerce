import { z } from "zod";
import { PAYMENT_METHODS } from "@nhatnang/core";

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

export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
