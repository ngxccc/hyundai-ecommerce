import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { PAYMENT_METHODS } from "@/database/schemas/enums.schema";

export const b2bOrderItemSchema = z.object({
  productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
  quantity: z
    .number()
    .int({ message: i18nZodMsg("validation.isInt") })
    .positive({ message: i18nZodMsg("validation.isPositive") }),
  unitPrice: z
    .union([
      z.number().positive({ message: i18nZodMsg("validation.isPositive") }),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .optional()
    .nullable(),
});

export const createB2bOrderSchema = z.object({
  userId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  leadId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  customerName: zSanitizedString({ min: 2, max: 100 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zEmail().optional().nullable().or(z.literal("")),
  companyName: zSanitizedString({ max: 255 }).optional().nullable(),
  shippingAddress: zSanitizedString({ min: 5, max: 500 }),
  paymentMethod: z.enum(PAYMENT_METHODS).default("BANK_TRANSFER"),
  shippingFee: z
    .union([
      z.number().min(0),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .default(0),
  depositAmount: z
    .union([
      z.number().min(0),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .default(0),
  note: zSanitizedString({ max: 1000 }).optional().nullable(),
  items: z
    .array(b2bOrderItemSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type B2bOrderItemDto = z.infer<typeof b2bOrderItemSchema>;
export type CreateB2bOrderDtoType = z.infer<typeof createB2bOrderSchema>;

export class B2bOrderItemInputDto implements B2bOrderItemDto {
  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Product UUID to purchase",
  })
  public productId!: string;

  @ApiProperty({
    example: 2,
    description: "Item quantity",
    minimum: 1,
  })
  public quantity!: number;

  @ApiPropertyOptional({
    example: "120000000.00",
    description: "Custom agreed unit price overriding catalog price",
  })
  public unitPrice?: string | number | null;
}

export class CreateB2bOrderDto implements CreateB2bOrderDtoType {
  public static readonly zodSchema = createB2bOrderSchema;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    description: "Linked customer/dealer user UUID if registered",
  })
  public userId?: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
    description: "Linked CRM Lead UUID for sales attribution & tracking",
  })
  public leadId?: string | null;

  @ApiProperty({
    example: "Nguyễn Văn Đại Lý",
    description: "Customer or representative name",
  })
  public customerName!: string;

  @ApiProperty({
    example: "0911223344",
    description: "Contact phone number",
  })
  public customerPhone!: string;

  @ApiPropertyOptional({
    example: "dealer@example.com",
    description: "Contact email",
  })
  public customerEmail?: string | null;

  @ApiPropertyOptional({
    example: "Công ty Cổ phần Năng Lượng Miền Trung",
    description: "Corporate company name",
  })
  public companyName?: string | null;

  @ApiProperty({
    example: "Kho số 4, Cảng Tiên Sa, TP. Đà Nẵng",
    description: "Shipping destination address",
  })
  public shippingAddress!: string;

  @ApiPropertyOptional({
    example: "TRADE_CREDIT",
    enum: PAYMENT_METHODS,
    default: "BANK_TRANSFER",
    description: "B2B Payment method (TRADE_CREDIT, BANK_TRANSFER, CASH)",
  })
  public paymentMethod!: (typeof PAYMENT_METHODS)[number];

  @ApiPropertyOptional({
    example: "500000.00",
    default: 0,
    description: "Freight / shipping fee",
  })
  public shippingFee!: string | number;

  @ApiPropertyOptional({
    example: "50000000.00",
    default: 0,
    description: "Initial deposit amount paid",
  })
  public depositAmount!: string | number;

  @ApiPropertyOptional({
    example: "Giao tại công trình kèm biên bản nghiệm thu",
    description: "Internal order notes",
  })
  public note?: string | null;

  @ApiProperty({
    type: [B2bOrderItemInputDto],
    description: "Order line items",
  })
  public items!: B2bOrderItemInputDto[];
}
