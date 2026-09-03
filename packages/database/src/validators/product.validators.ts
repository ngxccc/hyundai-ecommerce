import { type JSONContent } from "@nhatnang/core";
import { z } from "zod";

const numberFieldSchema = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((val, ctx) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: "custom",
        message: "validation.invalidNumber",
      });
      return z.NEVER;
    }
    return num;
  })
  .optional();

const numericStringSchema = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((val, ctx) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: "custom",
        message: "validation.invalidNumber",
      });
      return z.NEVER;
    }
    return String(num);
  })
  .optional();

export const PRODUCT_TYPES = ["generator", "ups", "ats", "accessory"] as const;
export const FUEL_TYPES = ["diesel", "gasoline", "gas"] as const;
export const PHASES = ["1phase", "3phase"] as const;
export const POWER_PHASES = ["1phase", "3phase", "multi_phase"] as const;
export const CANOPY_TYPES = [
  "silent",
  "super_silent",
  "open_frame",
  "closed_case",
  "tower",
  "rackmount",
] as const;
export const START_METHODS = [
  "electric",
  "recoil",
  "remote",
  "auto_ats",
] as const;
export const UPS_TOPOLOGIES = [
  "offline",
  "line_interactive",
  "online_double_conversion",
] as const;
export const UPS_BATTERY_TYPES = ["internal", "external"] as const;

export const specItemSchema = z.object({
  key: z.string().min(1),
  nameVi: z.string().min(1, "validation.specNameRequired"),
  nameEn: z.string().optional().default(""),
  value: z.string().min(1, "validation.specValueRequired"),
  unit: z.string().nullable().optional(),
});

export const specGroupSchema = z.object({
  groupKey: z.string().min(1),
  titleVi: z.string().min(1, "validation.groupTitleRequired"),
  titleEn: z.string().optional().default(""),
  order: z.number().int().default(0),
  items: z.array(specItemSchema).default([]),
});

export const specSheetSchema = z.array(specGroupSchema);
export const productSpecsSchema = z
  .object({
    model: z.string().optional(),
    power: numberFieldSchema,
    voltage: numberFieldSchema,
    frequency: numberFieldSchema,
    phase: z.enum(PHASES).optional(),
    engine: z.string().optional(),
    engineBrand: z.string().optional(),
    alternator: z.string().optional(),
    alternatorBrand: z.string().optional(),
    fuelType: z.enum(FUEL_TYPES).optional(),
    fuelConsumption: numberFieldSchema,
    fuelTankCapacity: numberFieldSchema,
    weight: numberFieldSchema,
    length: numberFieldSchema,
    width: numberFieldSchema,
    height: numberFieldSchema,
    noiseLevel: numberFieldSchema,
    warranty: numberFieldSchema,
    ratedCurrent: numberFieldSchema,
    powerFactor: numberFieldSchema,
    startingSystem: z.string().optional(),
    coolingSystem: z.string().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.boolean()]))
  .strict();

export const createProductSchema = z
  .object({
    nameVi: z.string().min(1, "validation.nameRequired"),
    nameEn: z.string().optional().or(z.literal("")).nullable(),
    slug: z.string().min(1, "validation.slugRequired"),
    price: z.string().min(1, "validation.priceRequired"),
    descriptionVi: z.custom<JSONContent>().nullable().optional(),
    descriptionEn: z.custom<JSONContent>().nullable().optional(),
    shortDescriptionVi: z.string().nullable().optional(),
    shortDescriptionEn: z.string().nullable().optional(),
    images: z.array(z.url("validation.invalidUrl")),
    brandId: z.uuid("validation.invalidBrand").nullable().optional(),
    categoryId: z.uuid("validation.invalidCategory").nullable().optional(),
    productType: z.enum(PRODUCT_TYPES).optional().default("generator"),
    powerKva: numericStringSchema,
    powerKw: numericStringSchema,
    standbyPowerKva: numericStringSchema,
    standbyPowerKw: numericStringSchema,
    phase: z.enum(POWER_PHASES).nullish(),
    voltage: z.string().nullish(),
    frequency: numberFieldSchema,
    fuelType: z.enum(FUEL_TYPES).nullish(),
    canopyType: z.enum(CANOPY_TYPES).optional(),
    startMethod: z.enum(START_METHODS).optional(),
    engineBrand: z.string().nullish(),
    alternatorBrand: z.string().nullish(),
    upsTopology: z.enum(UPS_TOPOLOGIES).optional(),
    upsBatteryType: z.enum(UPS_BATTERY_TYPES).optional(),
    specSheet: specSheetSchema.optional(),
    specs: productSpecsSchema.nullish(),
    isQuoteOnly: z.boolean(),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export type ProductSpecs = z.infer<typeof productSpecsSchema>;
export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
export type SpecItemInput = z.infer<typeof specItemSchema>;
export type SpecGroupInput = z.infer<typeof specGroupSchema>;
export type SpecSheetInput = z.infer<typeof specSheetSchema>;
