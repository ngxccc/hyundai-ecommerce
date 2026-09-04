import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { createBrandSchema } from "./create-brand.dto";

export const updateBrandSchema = createBrandSchema.partial().strict();

export type UpdateBrandDtoType = z.infer<typeof updateBrandSchema>;

export class UpdateBrandDto implements UpdateBrandDtoType {
  public static readonly zodSchema = updateBrandSchema;
  @ApiPropertyOptional({ example: "Hyundai Power Vietnam" })
  public name?: string;

  @ApiPropertyOptional({ example: "hyundai-power-vietnam" })
  public slug?: string;

  @ApiPropertyOptional({ example: "https://example.com/new-logo.png" })
  public logo?: string | null;

  @ApiPropertyOptional({ example: "Mô tả thương hiệu mới" })
  public descriptionVi?: string | null;

  @ApiPropertyOptional({ example: "New brand description" })
  public descriptionEn?: string | null;

  @ApiPropertyOptional({ example: true })
  public isActive?: boolean;
}
