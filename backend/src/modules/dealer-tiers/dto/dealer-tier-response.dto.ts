import { ApiProperty } from "@nestjs/swagger";

export class DealerTierResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  id!: string;

  @ApiProperty({ example: "Hạng Vàng" })
  nameVi!: string;

  @ApiProperty({ example: "Gold Tier", nullable: true })
  nameEn!: string | null;

  @ApiProperty({
    example: "15.00",
    description: "Discount percentage applied to wholesale catalog prices",
  })
  discountPercentage!: string;

  @ApiProperty({
    example: "500000000.00",
    description: "Minimum spend requirement to qualify for this tier",
  })
  minimumSpend!: string;
}
