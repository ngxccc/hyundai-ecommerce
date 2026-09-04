import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const createBrandSchema = z
  .object({
    name: zSanitizedString({ min: 2, max: 255 }),
    slug: z
      .string(i18nZodMsg("validation.isString"))
      .min(2, { message: i18nZodMsg("validation.minLength", { "0": 2 }) })
      .max(255, { message: i18nZodMsg("validation.maxLength", { "0": 255 }) })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: i18nZodMsg("validation.matches"),
      }),
    logo: zSanitizedString({ max: 500 }).nullish(),
    descriptionVi: zSanitizedString({ max: 2000 }).nullish(),
    descriptionEn: zSanitizedString({ max: 2000 }).nullish(),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateBrandDtoType = z.infer<typeof createBrandSchema>;

export class CreateBrandDto implements CreateBrandDtoType {
  public static readonly zodSchema = createBrandSchema;

  @ApiProperty({
    example: "Hyundai Power",
    description: "Brand name",
  })
  public name!: string;

  @ApiProperty({
    example: "hyundai-power",
    description: "Brand URL slug",
  })
  public slug!: string;

  @ApiPropertyOptional({
    example: "https://res.cloudinary.com/hyundai/image/upload/logo.png",
  })
  public logo?: string | null;

  @ApiPropertyOptional({
    example:
      "Thương hiệu thiết bị năng lượng và máy phát điện hàng đầu Hàn Quốc",
  })
  public descriptionVi?: string | null;

  @ApiPropertyOptional({
    example: "Leading Korean power equipment and generator manufacturer",
  })
  public descriptionEn?: string | null;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  public isActive!: boolean;
}
