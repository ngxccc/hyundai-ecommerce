import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const adminQuoteItemInputSchema = z.object({
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
  unitPrice: z.union([
    z.number().nonnegative({ message: i18nZodMsg("validation.isPositive") }),
    z.string().regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    }),
  ]),
  discountPercent: z
    .union([
      z.number().min(0).max(100),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .default(0),
});

export const commercialTermsSchema = z.object({
  validityDays: z.number().int().positive().default(15),
  paymentSchedule: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  deliveryTime: z.string().optional().nullable(),
  deliveryLocation: z.string().optional().nullable(),
});

export const createAdminQuoteSchema = z.object({
  userId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  customerName: zSanitizedString({ min: 2 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zEmail().optional().nullable().or(z.literal("")),
  companyName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  vatRate: z.number().min(0).max(100).default(10),
  commercialTerms: commercialTermsSchema.optional().nullable(),
  note: z.string().optional().nullable(),
  expirationDate: z.coerce.date().optional().nullable(),
  items: z
    .array(adminQuoteItemInputSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type AdminQuoteItemInputDtoType = z.infer<
  typeof adminQuoteItemInputSchema
>;
export type CommercialTermsDtoType = z.infer<typeof commercialTermsSchema>;
export type CreateAdminQuoteDtoType = z.infer<typeof createAdminQuoteSchema>;

export class AdminQuoteItemInputDto implements AdminQuoteItemInputDtoType {
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
    example: 1,
    minimum: 1,
    description: "Item quantity",
  })
  public quantity!: number;

  @ApiProperty({
    example: 28000000,
    description: "Unit price quoted to customer (VND)",
  })
  public unitPrice!: number | string;

  @ApiPropertyOptional({
    example: 5,
    default: 0,
    description: "Line item discount percentage (0 - 100)",
  })
  public discountPercent: number | string = 0;
}

export class CommercialTermsDto implements CommercialTermsDtoType {
  @ApiPropertyOptional({
    example: 15,
    default: 15,
    description: "Quote validity duration in days",
  })
  public validityDays = 15;

  @ApiPropertyOptional({
    example: "Tạm ứng 30%, thanh toán 70% trước khi giao hàng",
    description: "Commercial payment schedule and terms",
  })
  public paymentSchedule?: string | null;

  @ApiPropertyOptional({
    example: "Bảo hành chính hãng Hyundai 24 tháng hoặc 2000 giờ chạy",
    description: "Commercial warranty terms",
  })
  public warrantyTerms?: string | null;

  @ApiPropertyOptional({
    example: "Trong vòng 03 ngày làm việc kể từ ngày nhận tạm ứng",
    description: "Estimated lead time and delivery schedule",
  })
  public deliveryTime?: string | null;

  @ApiPropertyOptional({
    example: "Giao tại chân công trình bên mua",
    description: "Delivery destination or handover site",
  })
  public deliveryLocation?: string | null;
}

export class CreateAdminQuoteDto implements CreateAdminQuoteDtoType {
  public static readonly zodSchema = createAdminQuoteSchema;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    description: "Dealer or customer UUID if registered account",
  })
  public userId?: string | null;

  @ApiProperty({
    example: "Công ty TNHH Kỹ Thuật Điện Quang",
    description: "Customer or enterprise primary contact",
  })
  public customerName!: string;

  @ApiProperty({
    example: "0918123456",
    description: "Customer contact phone number",
  })
  public customerPhone!: string;

  @ApiPropertyOptional({
    example: "sales@dienquang.com.vn",
    description: "Customer contact email",
  })
  public customerEmail?: string | null;

  @ApiPropertyOptional({
    example: "Công ty TNHH Kỹ Thuật Điện Quang",
    description: "Enterprise registered corporate entity",
  })
  public companyName?: string | null;

  @ApiPropertyOptional({
    example: "0309988776",
    description: "Corporate enterprise tax ID",
  })
  public taxId?: string | null;

  @ApiPropertyOptional({
    example: "Khu Công Nghiệp Sóng Thần 2, Dĩ An, Bình Dương",
    description: "Project handover destination",
  })
  public shippingAddress?: string | null;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: "VAT percentage rate (e.g. 10 or 8)",
  })
  public vatRate = 10;

  @ApiPropertyOptional({
    type: CommercialTermsDto,
    description: "Structured commercial, warranty, and delivery terms",
  })
  public commercialTerms?: CommercialTermsDto | null;

  @ApiPropertyOptional({
    example: "Báo giá áp dụng theo chính sách đại lý cấp 1",
    description: "Internal sales or admin remarks",
  })
  public note?: string | null;

  @ApiPropertyOptional({
    example: "2026-09-30T00:00:00.000Z",
    description: "Explicit quote expiration timestamp",
  })
  public expirationDate?: Date | null;

  @ApiProperty({
    type: [AdminQuoteItemInputDto],
    description: "Quotation line items with pricing and discounts",
  })
  public items!: AdminQuoteItemInputDto[];
}
