import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
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

export const specItemSchema = z.object({
  key: z.string(),
  nameVi: z.string(),
  nameEn: z.string().optional(),
  value: z.string(),
  unit: z.string().nullish(),
});

export const specGroupSchema = z.object({
  groupKey: z.string(),
  titleVi: z.string(),
  titleEn: z.string().optional(),
  order: z.number().int().default(0),
  items: z.array(specItemSchema),
});

export const productSpecSheetSchema = z.array(specGroupSchema);

export const jsonContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      content: z.array(jsonContentSchema).optional(),
      marks: z
        .array(
          z
            .object({
              type: z.string(),
              attrs: z.record(z.string(), z.unknown()).optional(),
            })
            .catchall(z.unknown()),
        )
        .optional(),
      text: z.string().optional(),
    })
    .catchall(z.unknown()),
);

export const productSpecsSchema = z
  .object({
    model: z.string().optional(),
    origin: z.string().optional(),
    engineModel: z.string().optional(),
    alternatorModel: z.string().optional(),
    controller: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    noiseLevel: z.string().optional(),
    fuelConsumption: z.string().optional(),
    warranty: z.string().optional(),
  })
  .catchall(z.unknown())
  .default({});

export const createProductSchema = z
  .object({
    nameVi: zSanitizedString({ min: 2, max: 255 }),
    nameEn: zSanitizedString({ max: 255 }).nullish(),
    slug: z
      .string(i18nZodMsg("validation.isString"))
      .min(2, { message: i18nZodMsg("validation.minLength", { "0": 2 }) })
      .max(255, { message: i18nZodMsg("validation.maxLength", { "0": 255 }) })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: i18nZodMsg("validation.matches"),
      }),
    price: z
      .number()
      .min(0, {
        message: i18nZodMsg("validation.isNonNegative", { property: "price" }),
      })
      .default(0),
    descriptionVi: jsonContentSchema.nullish(),
    descriptionEn: jsonContentSchema.nullish(),
    shortDescriptionVi: zSanitizedString({ max: 1000 }).nullish(),
    shortDescriptionEn: zSanitizedString({ max: 1000 }).nullish(),
    images: z.array(zSanitizedString({ max: 500 })).default([]),
    brandId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
    categoryId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
    productType: z.enum(PRODUCT_TYPES).default("generator"),
    powerKva: z.number().positive().nullish(),
    powerKw: z.number().positive().nullish(),
    standbyPowerKva: z.number().positive().nullish(),
    standbyPowerKw: z.number().positive().nullish(),
    phase: z.enum(POWER_PHASES).nullish(),
    voltage: zSanitizedString({ max: 50 }).nullish(),
    frequency: z.number().int().positive().default(50),
    fuelType: z.enum(FUEL_TYPES).nullish(),
    canopyType: z.enum(CANOPY_TYPES).nullish(),
    startMethod: z.enum(START_METHODS).nullish(),
    engineBrand: zSanitizedString({ max: 100 }).nullish(),
    alternatorBrand: zSanitizedString({ max: 100 }).nullish(),
    upsTopology: z.enum(UPS_TOPOLOGIES).nullish(),
    upsBatteryType: z.enum(UPS_BATTERY_TYPES).nullish(),
    specSheet: productSpecSheetSchema.default([]),
    specs: productSpecsSchema,
    totalStockCache: z.number().int().min(0).default(0),
    isQuoteOnly: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateProductDtoType = z.infer<typeof createProductSchema>;

export class CreateProductDto implements CreateProductDtoType {
  public static readonly zodSchema = createProductSchema;

  @ApiProperty({ example: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha" })
  public nameVi!: string;

  @ApiPropertyOptional({
    example: "Hyundai DHY65KSE 60kVA 3-Phase Diesel Generator",
  })
  public nameEn?: string | null;

  @ApiProperty({ example: "may-phat-dien-diesel-hyundai-dhy65kse" })
  public slug!: string;

  @ApiProperty({ example: 245000000 })
  public price!: number;

  @ApiPropertyOptional({ example: { type: "doc", content: [] } })
  public descriptionVi?: JSONContent | null;

  @ApiPropertyOptional({ example: { type: "doc", content: [] } })
  public descriptionEn?: JSONContent | null;

  @ApiPropertyOptional({ example: "Máy phát điện 60kVA vỏ chống ồn đồng bộ" })
  public shortDescriptionVi?: string | null;

  @ApiPropertyOptional({
    example: "60kVA diesel generator with soundproof canopy",
  })
  public shortDescriptionEn?: string | null;

  @ApiPropertyOptional({
    example: ["https://res.cloudinary.com/hyundai/image/upload/dhy65kse.jpg"],
    default: [],
  })
  public images!: string[];

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public brandId?: string | null;

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public categoryId?: string | null;

  @ApiPropertyOptional({
    enum: PRODUCT_TYPES,
    default: "generator",
  })
  public productType!: ProductType;

  @ApiPropertyOptional({ example: 60 })
  public powerKva?: number | null;

  @ApiPropertyOptional({ example: 48 })
  public powerKw?: number | null;

  @ApiPropertyOptional({ example: 66 })
  public standbyPowerKva?: number | null;

  @ApiPropertyOptional({ example: 52.8 })
  public standbyPowerKw?: number | null;

  @ApiPropertyOptional({
    enum: POWER_PHASES,
    example: "3phase",
  })
  public phase?: PowerPhase | null;

  @ApiPropertyOptional({ example: "230/400V" })
  public voltage?: string | null;

  @ApiPropertyOptional({ example: 50, default: 50 })
  public frequency!: number;

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
    enum: START_METHODS,
    example: "electric",
  })
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

  @ApiPropertyOptional({
    example: [
      {
        groupKey: "general",
        titleVi: "Thông số chung",
        order: 1,
        items: [
          {
            key: "model",
            nameVi: "Model",
            value: "DHY65KSE",
          },
        ],
      },
    ],
  })
  public specSheet!: ProductSpecSheet;

  @ApiPropertyOptional({
    example: {
      model: "DHY65KSE",
      origin: "Hàn Quốc",
      dimensions: "2250 x 950 x 1300 mm",
      weight: "1150 kg",
    },
  })
  public specs!: ProductSpecs;
  @ApiPropertyOptional({ example: 5, default: 0 })
  public totalStockCache!: number;

  @ApiPropertyOptional({ example: true, default: true })
  public isActive!: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  public isQuoteOnly!: boolean;
}
