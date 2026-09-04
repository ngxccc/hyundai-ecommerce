import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const createQuoteItemSchema = z.object({
  productId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  isCustomItem: z.boolean().default(false),
  itemName: zSanitizedString({ min: 1 }),
  itemModel: z.string().optional().nullable(),
  itemSpecs: z.string().optional().nullable(),
  quantity: z
    .number()
    .int({ message: i18nZodMsg("validation.isInt") })
    .positive({ message: i18nZodMsg("validation.isPositive") }),
  requestedPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    })
    .optional()
    .nullable(),
});

export const createQuoteSchema = z.object({
  customerName: zSanitizedString({ min: 2 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zEmail().optional().nullable().or(z.literal("")),
  companyName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  items: z
    .array(createQuoteItemSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type CreateQuoteItemDtoType = z.infer<typeof createQuoteItemSchema>;
export type CreateQuoteDtoType = z.infer<typeof createQuoteSchema>;

export class CreateQuoteItemDto implements CreateQuoteItemDtoType {
  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Catalog product UUID, or null for bespoke custom item",
  })
  public productId?: string | null;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: "Whether this is a bespoke line item not in catalog",
  })
  public isCustomItem = false;

  @ApiProperty({
    example: "Máy phát điện Hyundai DHY6000SE",
    description: "Item name or description",
  })
  public itemName!: string;

  @ApiPropertyOptional({
    example: "DHY6000SE",
    description: "Manufacturer model code",
  })
  public itemModel?: string | null;

  @ApiPropertyOptional({
    example: "5.0kVA - 230V / 50Hz - Chống ồn",
    description: "Technical specifications summary",
  })
  public itemSpecs?: string | null;

  @ApiProperty({
    example: 2,
    minimum: 1,
    description: "Requested quantity",
  })
  public quantity!: number;

  @ApiPropertyOptional({
    example: "25000000.00",
    description: "Customer target/requested unit price",
  })
  public requestedPrice?: string | null;
}

export class CreateQuoteDto implements CreateQuoteDtoType {
  public static readonly zodSchema = createQuoteSchema;

  @ApiProperty({
    example: "Công ty Cổ phần Xây dựng Nam Á",
    description: "Customer or company contact name",
  })
  public customerName!: string;

  @ApiProperty({
    example: "0901234567",
    description: "Customer contact phone number",
  })
  public customerPhone!: string;

  @ApiPropertyOptional({
    example: "contact@nama.vn",
    description: "Customer contact email",
  })
  public customerEmail?: string | null;

  @ApiPropertyOptional({
    example: "Công ty Cổ phần Xây dựng Nam Á",
    description: "Full registered company name",
  })
  public companyName?: string | null;

  @ApiPropertyOptional({
    example: "0312345678",
    description: "Corporate enterprise tax ID",
  })
  public taxId?: string | null;

  @ApiPropertyOptional({
    example: "Số 45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
    description: "Project or delivery site destination",
  })
  public shippingAddress?: string | null;

  @ApiPropertyOptional({
    example: "Yêu cầu giao hàng trước ngày 15/10",
    description: "Customer special requirements or notes",
  })
  public note?: string | null;

  @ApiProperty({
    type: [CreateQuoteItemDto],
    description: "List of requested quote items",
  })
  public items!: CreateQuoteItemDto[];
}
