import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const updateStockSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    stock: z.number().int().min(0),
    minStockWarning: z.number().int().min(0).default(2),
  })
  .strict();

export type UpdateStockDtoType = z.infer<typeof updateStockSchema>;

export class UpdateStockDto implements UpdateStockDtoType {
  public static readonly zodSchema = updateStockSchema;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Product UUID",
  })
  public productId!: string;

  @ApiProperty({
    example: 10,
    description: "Physical stock quantity available in this warehouse",
    minimum: 0,
  })
  public stock!: number;

  @ApiPropertyOptional({
    example: 2,
    default: 2,
    description: "Threshold quantity to trigger low-stock warning",
    minimum: 0,
  })
  public minStockWarning!: number;
}
