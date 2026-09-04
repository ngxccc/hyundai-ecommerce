import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CategoryResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Máy phát điện công nghiệp" })
  public nameVi!: string;

  @ApiPropertyOptional({ example: "Industrial Generators", nullable: true })
  public nameEn!: string | null;

  @ApiProperty({ example: "may-phat-dien-cong-nghiep" })
  public slug!: string;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: "Parent category ID or null if root",
  })
  public parentId!: string | null;

  @ApiPropertyOptional({ example: "Mô tả danh mục", nullable: true })
  public descriptionVi!: string | null;

  @ApiPropertyOptional({ example: "Category description", nullable: true })
  public descriptionEn!: string | null;

  @ApiPropertyOptional({
    example: "https://res.cloudinary.com/hyundai/image/upload/cat.jpg",
    nullable: true,
  })
  public image!: string | null;

  @ApiProperty({ example: true })
  public isActive!: boolean;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;

  @ApiPropertyOptional({
    type: () => [CategoryResponseDto],
    description: "Recursive child categories tree",
  })
  public children?: CategoryResponseDto[];
}
