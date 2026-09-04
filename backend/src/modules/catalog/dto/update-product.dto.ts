import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { createProductSchema } from "./create-product.dto";
import {
  CANOPY_TYPES,
  FUEL_TYPES,
  POWER_PHASES,
  PRODUCT_TYPES,
  START_METHODS,
  UPS_BATTERY_TYPES,
  UPS_TOPOLOGIES,
  type CanopyType,
  type FuelType,
  type JSONContent,
  type PowerPhase,
  type ProductSpecSheet,
  type ProductSpecs,
  type ProductType,
  type StartMethod,
  type UpsBatteryType,
  type UpsTopology,
} from "@/types/product-spec.type";

export const updateProductSchema = createProductSchema.partial().strict();

export type UpdateProductDtoType = z.infer<typeof updateProductSchema>;

export class UpdateProductDto implements UpdateProductDtoType {
  public static readonly zodSchema = updateProductSchema;

  @ApiPropertyOptional({ example: "Máy phát điện cập nhật" })
  public nameVi?: string;

  @ApiPropertyOptional({ example: "Updated Generator" })
  public nameEn?: string | null;

  @ApiPropertyOptional({ example: "may-phat-dien-cap-nhat" })
  public slug?: string;

  @ApiPropertyOptional({ example: 250000000 })
  public price?: number;

  @ApiPropertyOptional({ example: { type: "doc", content: [] } })
  public descriptionVi?: JSONContent | null;

  @ApiPropertyOptional({ example: { type: "doc", content: [] } })
  public descriptionEn?: JSONContent | null;

  @ApiPropertyOptional({ example: "Mô tả ngắn mới" })
  public shortDescriptionVi?: string | null;

  @ApiPropertyOptional({ example: "New short description" })
  public shortDescriptionEn?: string | null;

  @ApiPropertyOptional({ example: [] })
  public images?: string[];

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public brandId?: string | null;

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public categoryId?: string | null;

  @ApiPropertyOptional({ enum: PRODUCT_TYPES })
  public productType?: ProductType;

  @ApiPropertyOptional({ example: 65 })
  public powerKva?: number | null;

  @ApiPropertyOptional({ example: 52 })
  public powerKw?: number | null;

  @ApiPropertyOptional({ example: 70 })
  public standbyPowerKva?: number | null;

  @ApiPropertyOptional({ example: 56 })
  public standbyPowerKw?: number | null;

  @ApiPropertyOptional({ enum: POWER_PHASES })
  public phase?: PowerPhase | null;

  @ApiPropertyOptional({ example: "230/400V" })
  public voltage?: string | null;

  @ApiPropertyOptional({ example: 50 })
  public frequency?: number;

  @ApiPropertyOptional({ enum: FUEL_TYPES })
  public fuelType?: FuelType | null;

  @ApiPropertyOptional({
    enum: CANOPY_TYPES,
  })
  public canopyType?: CanopyType | null;

  @ApiPropertyOptional({ enum: START_METHODS })
  public startMethod?: StartMethod | null;

  @ApiPropertyOptional({ example: "Hyundai" })
  public engineBrand?: string | null;

  @ApiPropertyOptional({ example: "Hyundai" })
  public alternatorBrand?: string | null;

  @ApiPropertyOptional({
    enum: UPS_TOPOLOGIES,
  })
  public upsTopology?: UpsTopology | null;

  @ApiPropertyOptional({ enum: UPS_BATTERY_TYPES })
  public upsBatteryType?: UpsBatteryType | null;

  @ApiPropertyOptional({ example: [] })
  public specSheet?: ProductSpecSheet;

  @ApiPropertyOptional({ example: { model: "DHY65KSE" } })
  public specs?: ProductSpecs;

  @ApiPropertyOptional({ example: 10 })
  public totalStockCache?: number;

  @ApiPropertyOptional({ example: true })
  public isActive?: boolean;
}
