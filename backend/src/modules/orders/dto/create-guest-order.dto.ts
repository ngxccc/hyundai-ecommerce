import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { PAYMENT_METHODS } from "@/database/schemas/enums.schema";

export const guestOrderItemSchema = z.object({
  productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
  quantity: z
    .number()
    .int({ message: i18nZodMsg("validation.isInt") })
    .positive({ message: i18nZodMsg("validation.isPositive") }),
});

export const createGuestOrderSchema = z.object({
  customerName: zSanitizedString({ min: 2, max: 100 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zEmail().optional().nullable().or(z.literal("")),
  shippingAddress: zSanitizedString({ min: 5, max: 500 }),
  paymentMethod: z.enum(PAYMENT_METHODS).default("PAYOS"),
  note: zSanitizedString({ max: 1000 }).optional().nullable(),
  items: z
    .array(guestOrderItemSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type GuestOrderItemDto = z.infer<typeof guestOrderItemSchema>;
export type CreateGuestOrderDtoType = z.infer<typeof createGuestOrderSchema>;

export class GuestOrderItemInputDto implements GuestOrderItemDto {
  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Product UUID to purchase",
  })
  public productId!: string;

  @ApiProperty({
    example: 1,
    description: "Item quantity",
    minimum: 1,
  })
  public quantity!: number;
}

export class CreateGuestOrderDto implements CreateGuestOrderDtoType {
  public static readonly zodSchema = createGuestOrderSchema;

  @ApiProperty({
    example: "Nguyễn Văn A",
    description: "Customer full name",
  })
  public customerName!: string;

  @ApiProperty({
    example: "0901234567",
    description: "Customer Vietnamese contact phone number",
  })
  public customerPhone!: string;

  @ApiPropertyOptional({
    example: "nguyenvana@example.com",
    description: "Customer email address for notifications",
  })
  public customerEmail?: string | null;

  @ApiProperty({
    example: "Số 123 Đường Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh",
    description: "Delivery destination street address",
  })
  public shippingAddress!: string;

  @ApiPropertyOptional({
    example: "PAYOS",
    enum: PAYMENT_METHODS,
    default: "PAYOS",
    description: "Checkout payment method",
  })
  public paymentMethod!: (typeof PAYMENT_METHODS)[number];

  @ApiPropertyOptional({
    example: "Giao hàng trong giờ hành chính",
    description: "Customer delivery notes",
  })
  public note?: string | null;

  @ApiProperty({
    type: [GuestOrderItemInputDto],
    description: "Order line items",
  })
  public items!: GuestOrderItemInputDto[];
}
