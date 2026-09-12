import { createZodDto } from "@/common/dto";
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
  type JSONContent,
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

export const baseProductSpecsSchema = z
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
  .catchall(z.unknown());

export const productSpecsSchema = baseProductSpecsSchema.default({});

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

export class CreateProductDto extends createZodDto(createProductSchema) {
  public static readonly zodSchema = createProductSchema;
}
