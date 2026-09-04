import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StockProductItemDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Máy phát điện Diesel Hyundai DHY65KSE" })
  public nameVi!: string;

  @ApiProperty({ example: "may-phat-dien-diesel-hyundai-dhy65kse" })
  public slug!: string;

  @ApiProperty({ example: 15 })
  public totalStockCache!: number;
}

export class StockWarehouseItemDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Kho Tổng Hà Nội" })
  public nameVi!: string;

  @ApiProperty({ example: "Hà Nội" })
  public city!: string;
}

export class WarehouseStockResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public warehouseId!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public productId!: string;

  @ApiProperty({ example: 10 })
  public stock!: number;

  @ApiProperty({ example: 2 })
  public minStockWarning!: number;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;

  @ApiPropertyOptional({ type: () => StockProductItemDto })
  public product?: StockProductItemDto | null;

  @ApiPropertyOptional({ type: () => StockWarehouseItemDto })
  public warehouse?: StockWarehouseItemDto | null;
}
