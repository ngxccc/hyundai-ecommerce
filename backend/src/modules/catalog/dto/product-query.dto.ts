import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  zNumericString,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import {
  CANOPY_TYPES,
  FUEL_TYPES,
  POWER_PHASES,
  type CanopyType,
  type FuelType,
  type PowerPhase,
} from "@/types/product-spec.type";

export const PRODUCT_SORT_OPTIONS = [
  "newest",
  "priceAsc",
  "priceDesc",
] as const;
export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number];

export const productQuerySchema = z
  .object({
    page: zNumericString({ min: 1 }).default(1),
    limit: zNumericString({ min: 1, max: 100 }).default(20),
    search: zSanitizedString({ max: 255 }).nullish(),
    brandId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
    categoryId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
    priceMin: zNumericString({ min: 0 }).nullish(),
    priceMax: zNumericString({ min: 0 }).nullish(),
    powerKvaMin: zNumericString({ min: 0 }).nullish(),
    powerKvaMax: zNumericString({ min: 0 }).nullish(),
    voltage: zSanitizedString({ max: 50 }).nullish(),
    phase: z.enum(POWER_PHASES).nullish(),
    fuelType: z.enum(FUEL_TYPES).nullish(),
    canopyType: z.enum(CANOPY_TYPES).nullish(),
    sort: z.enum(PRODUCT_SORT_OPTIONS).default("newest"),
  })
  .strict();

export type ProductQueryDtoType = z.infer<typeof productQuerySchema>;

export class ProductQueryDto implements ProductQueryDtoType {
  public static readonly zodSchema = productQuerySchema;

  @ApiPropertyOptional({ example: 1, default: 1, description: "Page number" })
  public page!: number;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: "Items per page (max 100)",
  })
  public limit!: number;

  @ApiPropertyOptional({ example: "Hyundai", description: "Search keyword" })
  public search?: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Filter by brand UUID",
  })
  public brandId?: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    description: "Filter by category UUID",
  })
  public categoryId?: string | null;

  @ApiPropertyOptional({
    example: 10000000,
    description: "Minimum price in VND",
  })
  public priceMin?: number | null;

  @ApiPropertyOptional({
    example: 500000000,
    description: "Maximum price in VND",
  })
  public priceMax?: number | null;

  @ApiPropertyOptional({
    example: 20,
    description: "Minimum power rating in kVA",
  })
  public powerKvaMin?: number | null;

  @ApiPropertyOptional({
    example: 100,
    description: "Maximum power rating in kVA",
  })
  public powerKvaMax?: number | null;

  @ApiPropertyOptional({
    example: "230V",
    description: "Filter by voltage string",
  })
  public voltage?: string | null;

  @ApiPropertyOptional({
    enum: POWER_PHASES,
    example: "3phase",
  })
  public phase?: PowerPhase | null;

  @ApiPropertyOptional({
    enum: FUEL_TYPES,
    example: "diesel",
  })
  public fuelType?: FuelType | null;

  @ApiPropertyOptional({
    enum: CANOPY_TYPES,
    example: "silent",
  })
  public canopyType?: CanopyType | null;

  @ApiPropertyOptional({
    enum: PRODUCT_SORT_OPTIONS,
    default: "newest",
    example: "newest",
  })
  public sort!: ProductSortOption;
}
