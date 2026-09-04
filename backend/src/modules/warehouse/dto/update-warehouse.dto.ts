import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { createWarehouseSchema } from "./create-warehouse.dto";

export const updateWarehouseSchema = createWarehouseSchema.partial().strict();

export type UpdateWarehouseDtoType = z.infer<typeof updateWarehouseSchema>;

export class UpdateWarehouseDto implements UpdateWarehouseDtoType {
  public static readonly zodSchema = updateWarehouseSchema;

  @ApiPropertyOptional({ example: "Kho Tổng Hà Nội Cập Nhật" })
  public nameVi?: string;

  @ApiPropertyOptional({ example: "Hanoi Main Warehouse Updated" })
  public nameEn?: string | null;

  @ApiPropertyOptional({ example: "386 Nguyễn Văn Linh" })
  public streetAddress?: string;

  @ApiPropertyOptional({ example: "Long Biên" })
  public district?: string;

  @ApiPropertyOptional({ example: "Hà Nội" })
  public city?: string;

  @ApiPropertyOptional({ example: true })
  public isActive?: boolean;
}
