import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const createCategorySchema = z
  .object({
    nameVi: zSanitizedString({ min: 2, max: 255 }),
    nameEn: zSanitizedString({ max: 255 }).nullish(),
    slug: z
      .string(i18nZodMsg("validation.isString"))
      .min(2, { message: i18nZodMsg("validation.minLength", { "0": 2 }) })
      .max(255, { message: i18nZodMsg("validation.maxLength", { "0": 255 }) })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: i18nZodMsg("validation.matches"),
      }),
    parentId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
    descriptionVi: zSanitizedString({ max: 2000 }).nullish(),
    descriptionEn: zSanitizedString({ max: 2000 }).nullish(),
    image: zSanitizedString({ max: 500 }).nullish(),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateCategoryDtoType = z.infer<typeof createCategorySchema>;

export class CreateCategoryDto implements CreateCategoryDtoType {
  public static readonly zodSchema = createCategorySchema;

  @ApiProperty({
    example: "Máy phát điện công nghiệp",
    description: "Category name in Vietnamese",
  })
  public nameVi!: string;

  @ApiPropertyOptional({
    example: "Industrial Generators",
    description: "Category name in English",
  })
  public nameEn?: string | null;

  @ApiProperty({
    example: "may-phat-dien-cong-nghiep",
    description: "Unique URL slug",
  })
  public slug!: string;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Parent category UUID for hierarchical trees",
  })
  public parentId?: string | null;

  @ApiPropertyOptional({
    example: "Dòng máy phát điện công suất lớn từ 20kVA đến 2500kVA",
  })
  public descriptionVi?: string | null;

  @ApiPropertyOptional({
    example: "Heavy-duty industrial generator sets from 20kVA to 2500kVA",
  })
  public descriptionEn?: string | null;

  @ApiPropertyOptional({
    example: "https://res.cloudinary.com/hyundai/image/upload/category.jpg",
  })
  public image?: string | null;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  public isActive!: boolean;
}
