import { type JSONContent } from "@tiptap/core";
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

export const productSpecsSchema = z
  .object({
    model: z.string().optional(),
    power: numberFieldSchema,
    voltage: numberFieldSchema,
    frequency: numberFieldSchema,
    phase: z.enum(["1phase", "3phase"]).optional(),
    engine: z.string().optional(),
    engineBrand: z.string().optional(),
    alternator: z.string().optional(),
    alternatorBrand: z.string().optional(),
    fuelType: z.enum(["diesel", "gasoline", "gas"]).optional(),
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
    name: z.string().min(1, "validation.nameRequired"),
    slug: z.string().min(1, "validation.slugRequired"),
    price: z.string().min(1, "validation.priceRequired"),
    description: z.custom<JSONContent>().nullable().optional(),
    shortDescription: z.string().nullable().optional(),
    images: z.array(z.url("validation.invalidUrl")),
    brandId: z.uuid("validation.invalidBrand").nullable().optional(),
    categoryId: z.uuid("validation.invalidCategory").nullable().optional(),
    specs: productSpecsSchema.nullable().optional(),
    isQuoteOnly: z.boolean(),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export type TProductSpecs = z.infer<typeof productSpecsSchema>;
export type TCreateProductInput = z.infer<typeof createProductSchema>;
export type TUpdateProductInput = z.infer<typeof updateProductSchema>;
