import { z } from "zod";
import { orderStatusEnum } from "../schemas/order.schema";

export type TOrderValidationMessageKey =
  | "shippingBidsVendorNameRequired"
  | "shippingBidsQuotedPriceRequired";

export type IOrderTranslator = (key: TOrderValidationMessageKey) => string;

export const updateOrderStatusBaseSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(orderStatusEnum.enumValues),
});

export const getUpdateOrderStatusSchema = () =>
  z.object({
    orderId: z.uuid(),
    status: z.enum(orderStatusEnum.enumValues),
  });

export const selectShippingBidBaseSchema = z.object({
  orderId: z.uuid(),
  bidId: z.uuid(),
});

export const getSelectShippingBidSchema = () =>
  z.object({
    orderId: z.uuid(),
    bidId: z.uuid(),
  });

export const addShippingBidBaseSchema = z.object({
  orderId: z.uuid(),
  vendorName: z.string(),
  quotedPrice: z.string(),
  internalNote: z.string().optional(),
});

export const getAddShippingBidSchema = (t: IOrderTranslator) =>
  z.object({
    orderId: z.uuid(),
    vendorName: z
      .string()
      .min(1, { message: t("shippingBidsVendorNameRequired") }),
    quotedPrice: z
      .string()
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t("shippingBidsQuotedPriceRequired"),
      }),
    internalNote: z.string().optional(),
  });

export type TUpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusBaseSchema
>;
export type TSelectShippingBidInput = z.infer<
  typeof selectShippingBidBaseSchema
>;
export type TAddShippingBidInput = z.infer<typeof addShippingBidBaseSchema>;
