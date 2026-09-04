import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";

export const createWarehouseSchema = z
  .object({
    nameVi: zSanitizedString({ min: 1, max: 200 }),
    nameEn: zSanitizedString({ max: 200 }).nullish(),
    streetAddress: zSanitizedString({ min: 1, max: 255 }),
    district: zSanitizedString({ min: 1, max: 100 }),
    city: zSanitizedString({ min: 1, max: 100 }),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateWarehouseDtoType = z.infer<typeof createWarehouseSchema>;

export class CreateWarehouseDto implements CreateWarehouseDtoType {
  public static readonly zodSchema = createWarehouseSchema;

  @ApiProperty({
    example: "Kho Tổng Hà Nội",
    description: "Warehouse name in Vietnamese",
  })
  public nameVi!: string;

  @ApiPropertyOptional({
    example: "Hanoi Central Warehouse",
    description: "Warehouse name in English",
  })
  public nameEn?: string | null;

  @ApiProperty({
    example: "Lô CN-01, Khu Công Nghiệp Đài Tư, 386 Nguyễn Văn Linh",
    description: "Street address",
  })
  public streetAddress!: string;

  @ApiProperty({
    example: "Long Biên",
    description: "District / County",
  })
  public district!: string;

  @ApiProperty({
    example: "Hà Nội",
    description: "City / Province",
  })
  public city!: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: "Active status",
  })
  public isActive!: boolean;
}
