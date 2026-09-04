import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BrandResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Hyundai Power" })
  public name!: string;

  @ApiProperty({ example: "hyundai-power" })
  public slug!: string;

  @ApiPropertyOptional({
    example: "https://res.cloudinary.com/hyundai/image/upload/logo.png",
    nullable: true,
  })
  public logo!: string | null;

  @ApiPropertyOptional({
    example: "Thương hiệu thiết bị năng lượng hàng đầu",
    nullable: true,
  })
  public descriptionVi!: string | null;

  @ApiPropertyOptional({
    example: "Leading power equipment brand",
    nullable: true,
  })
  public descriptionEn!: string | null;

  @ApiProperty({ example: true })
  public isActive!: boolean;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}
