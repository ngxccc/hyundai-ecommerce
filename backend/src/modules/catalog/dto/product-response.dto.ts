import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CANOPY_TYPES,
  FUEL_TYPES,
  POWER_PHASES,
  PRODUCT_TYPES,
  START_METHODS,
  UPS_BATTERY_TYPES,
  UPS_TOPOLOGIES,
  type JSONContent,
  type ProductSpecSheet,
  type ProductSpecs,
} from "@/types/product-spec.type";
import { BrandResponseDto } from "./brand-response.dto";
import { CategoryResponseDto } from "./category-response.dto";

export class ProductResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha" })
  public nameVi!: string;

  @ApiPropertyOptional({
    example: "Hyundai DHY65KSE 60kVA 3-Phase Diesel Generator",
    nullable: true,
  })
  public nameEn!: string | null;

  @ApiProperty({ example: "may-phat-dien-diesel-hyundai-dhy65kse" })
  public slug!: string;

  @ApiProperty({ example: "245000000.00" })
  public price!: string;

  @ApiProperty({
    example: false,
    description: "Whether the product requires quotation request (price <= 0)",
  })
  public isQuoteOnly!: boolean;

  @ApiPropertyOptional({ example: null, nullable: true })
  public descriptionVi!: JSONContent | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  public descriptionEn!: JSONContent | null;

  @ApiPropertyOptional({
    example: "Máy phát điện 60kVA vỏ chống ồn",
    nullable: true,
  })
  public shortDescriptionVi!: string | null;

  @ApiPropertyOptional({
    example: "60kVA diesel generator",
    nullable: true,
  })
  public shortDescriptionEn!: string | null;

  @ApiProperty({
    example: ["https://res.cloudinary.com/hyundai/image/upload/dhy65kse.jpg"],
  })
  public images!: string[];

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    nullable: true,
  })
  public brandId!: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    nullable: true,
  })
  public categoryId!: string | null;

  @ApiPropertyOptional({
    enum: PRODUCT_TYPES,
    example: "generator",
  })
  public productType!: string;

  @ApiPropertyOptional({ example: "60.00", nullable: true })
  public powerKva!: string | null;

  @ApiPropertyOptional({ example: "48.00", nullable: true })
  public powerKw!: string | null;

  @ApiPropertyOptional({ example: "66.00", nullable: true })
  public standbyPowerKva!: string | null;

  @ApiPropertyOptional({ example: "52.80", nullable: true })
  public standbyPowerKw!: string | null;

  @ApiPropertyOptional({
    enum: POWER_PHASES,
    example: "3phase",
    nullable: true,
  })
  public phase!: string | null;

  @ApiPropertyOptional({ example: "230/400V", nullable: true })
  public voltage!: string | null;

  @ApiPropertyOptional({ example: 50, nullable: true })
  public frequency!: number | null;

  @ApiPropertyOptional({
    enum: FUEL_TYPES,
    example: "diesel",
    nullable: true,
  })
  public fuelType!: string | null;

  @ApiPropertyOptional({
    enum: CANOPY_TYPES,
    example: "silent",
    nullable: true,
  })
  public canopyType!: string | null;

  @ApiPropertyOptional({
    enum: START_METHODS,
    example: "electric",
    nullable: true,
  })
  public startMethod!: string | null;

  @ApiPropertyOptional({ example: "Hyundai", nullable: true })
  public engineBrand!: string | null;

  @ApiPropertyOptional({ example: "Hyundai", nullable: true })
  public alternatorBrand!: string | null;

  @ApiPropertyOptional({
    enum: UPS_TOPOLOGIES,
    nullable: true,
  })
  public upsTopology!: string | null;

  @ApiPropertyOptional({ enum: UPS_BATTERY_TYPES, nullable: true })
  public upsBatteryType!: string | null;

  @ApiProperty({ example: [] })
  public specSheet!: ProductSpecSheet;

  @ApiProperty({ example: { model: "DHY65KSE" } })
  public specs!: ProductSpecs;
  @ApiProperty({ example: 5 })
  public totalStockCache!: number;

  @ApiProperty({ example: 0 })
  public totalSalesCache!: number;

  @ApiProperty({ example: true })
  public isActive!: boolean;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;

  @ApiPropertyOptional({ type: () => BrandResponseDto, nullable: true })
  public brand?: BrandResponseDto | null;

  @ApiPropertyOptional({ type: () => CategoryResponseDto, nullable: true })
  public category?: CategoryResponseDto | null;
}
