import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { createCategorySchema } from "./create-category.dto";

export const updateCategorySchema = createCategorySchema.partial().strict();

export type UpdateCategoryDtoType = z.infer<typeof updateCategorySchema>;

export class UpdateCategoryDto implements UpdateCategoryDtoType {
  public static readonly zodSchema = updateCategorySchema;
  @ApiPropertyOptional({ example: "Máy phát điện công nghiệp cập nhật" })
  public nameVi?: string;

  @ApiPropertyOptional({ example: "Updated Industrial Generators" })
  public nameEn?: string | null;

  @ApiPropertyOptional({ example: "may-phat-dien-cong-nghiep-moi" })
  public slug?: string;

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public parentId?: string | null;

  @ApiPropertyOptional({ example: "Mô tả mới" })
  public descriptionVi?: string | null;

  @ApiPropertyOptional({ example: "New description" })
  public descriptionEn?: string | null;

  @ApiPropertyOptional({ example: "https://example.com/new-image.jpg" })
  public image?: string | null;

  @ApiPropertyOptional({ example: true })
  public isActive?: boolean;
}
