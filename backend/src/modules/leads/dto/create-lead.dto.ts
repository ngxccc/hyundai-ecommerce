import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const createLeadItemSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    quantity: z
      .number()
      .int({ message: i18nZodMsg("validation.isInt") })
      .positive({ message: i18nZodMsg("validation.isPositive") })
      .default(1),
  })
  .strict();

export type CreateLeadItemDtoType = z.infer<typeof createLeadItemSchema>;

export class CreateLeadItemDto implements CreateLeadItemDtoType {
  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "UUID of the requested product",
  })
  public productId!: string;

  @ApiProperty({
    example: 1,
    description: "Requested quantity",
    default: 1,
  })
  public quantity!: number;
}

export const createLeadSchema = z
  .object({
    fullName: zSanitizedString({ min: 2, max: 255 }),
    phoneNumber: zPhoneNumber(),
    email: zEmail().optional(),
    companyName: zSanitizedString({ min: 1, max: 255 }).optional(),
    city: zSanitizedString({ min: 2, max: 100 }),
    ward: zSanitizedString({ min: 2, max: 100 }),
    streetAddress: zSanitizedString({ min: 1, max: 255 }).optional(),
    notes: zSanitizedString({ min: 1, max: 2000 }).optional(),
    items: z
      .array(createLeadItemSchema)
      .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
  })
  .strict();

export type CreateLeadDtoType = z.infer<typeof createLeadSchema>;

export class CreateLeadDto implements CreateLeadDtoType {
  public static readonly zodSchema = createLeadSchema;

  @ApiProperty({
    example: "Nguyễn Văn An",
    description: "Full name of the contact person",
  })
  public fullName!: string;

  @ApiProperty({
    example: "0912345678",
    description: "10-digit Vietnamese mobile phone number",
  })
  public phoneNumber!: string;

  @ApiProperty({
    example: "an.nguyen@example.com",
    description: "Optional email for formal PDF quote dispatch",
    required: false,
  })
  public email?: string;

  @ApiProperty({
    example: "Công ty TNHH Cơ điện Bình Dương",
    description: "Optional company name for B2B/project quotes",
    required: false,
  })
  public companyName?: string;

  @ApiProperty({
    example: "Bình Dương",
    description: "Province / Municipality (Cấp 1)",
  })
  public city!: string;

  @ApiProperty({
    example: "Phường Dĩ An",
    description: "Ward / Commune (Cấp 2 tinh gọn)",
  })
  public ward!: string;

  @ApiProperty({
    example: "Khu công nghiệp Sóng Thần 1, Đường số 3",
    description: "Detailed street address, factory, or project site",
    required: false,
  })
  public streetAddress?: string;

  @ApiProperty({
    example: "Cần tư vấn máy phát điện diesel 60kVA kèm tủ ATS cho nhà máy may",
    description: "Customer power load notes or project description",
    required: false,
  })
  public notes?: string;

  @ApiProperty({
    type: [CreateLeadItemDto],
    description: "List of requested products and quantities",
  })
  public items!: CreateLeadItemDto[];
}
