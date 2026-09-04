import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class WarehouseResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Kho Tổng Hà Nội" })
  public nameVi!: string;

  @ApiPropertyOptional({ example: "Hanoi Central Warehouse", nullable: true })
  public nameEn!: string | null;

  @ApiProperty({
    example: "Lô CN-01, Khu Công Nghiệp Đài Tư, 386 Nguyễn Văn Linh",
  })
  public streetAddress!: string;

  @ApiProperty({ example: "Long Biên" })
  public district!: string;

  @ApiProperty({ example: "Hà Nội" })
  public city!: string;

  @ApiProperty({ example: true })
  public isActive!: boolean;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}
