import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CartProductSummaryDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA" })
  public nameVi!: string;

  @ApiPropertyOptional({
    example: "Hyundai DHY65KSE 60kVA Generator",
    nullable: true,
  })
  public nameEn!: string | null;

  @ApiProperty({ example: "may-phat-dien-diesel-hyundai-dhy65kse" })
  public slug!: string;

  @ApiProperty({ example: "245000000.00" })
  public price!: string;

  @ApiProperty({
    example: ["https://res.cloudinary.com/hyundai/image/upload/dhy65kse.jpg"],
  })
  public images!: string[];

  @ApiProperty({ example: 10 })
  public totalStockCache!: number;

  @ApiProperty({ example: true })
  public isActive!: boolean;

  @ApiProperty({ example: false })
  public isOutOfStock!: boolean;
}

export class CartItemResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public productId!: string;

  @ApiProperty({ example: 2 })
  public quantity!: number;

  @ApiProperty({ example: "490000000.00" })
  public lineTotal!: string;

  @ApiProperty({ type: () => CartProductSummaryDto })
  public product!: CartProductSummaryDto;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}
