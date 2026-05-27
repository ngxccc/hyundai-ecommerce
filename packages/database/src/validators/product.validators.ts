import { z } from "zod";

export type TProductValidationMessageKey =
  | "validation.nameRequired"
  | "validation.slugRequired"
  | "validation.priceRequired"
  | "validation.invalidUrl"
  | "validation.invalidBrand"
  | "validation.invalidCategory"
  | "validation.specKeyRequired"
  | "validation.specValueRequired";

export type IProductTranslator = (key: TProductValidationMessageKey) => string;

export const productSpecsSchema = z
  .object({
    model: z.string().optional(),
    power: z.string().optional(),
    voltage: z.string().optional(),
    frequency: z.string().optional(),
    phase: z.enum(["1 Phase", "3 Phase"]).optional(),
    engine: z.string().optional(),
    engineBrand: z.string().optional(),
    alternator: z.string().optional(),
    alternatorBrand: z.string().optional(),
    fuelType: z.enum(["Diesel", "Gasoline", "Gas"]).optional(),
    fuelConsumption: z.string().optional(),
    fuelTankCapacity: z.string().optional(),
    weight: z.string().optional(),
    dimensions: z.string().optional(),
    noiseLevel: z.string().optional(),
    warranty: z.string().optional(),
    ratedCurrent: z.string().optional(),
    powerFactor: z.string().optional(),
    startingSystem: z.string().optional(),
    coolingSystem: z.string().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.boolean()]));

export const createProductSchema = (t: IProductTranslator) =>
  z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    slug: z.string().min(1, t("validation.slugRequired")),
    price: z.string().min(1, t("validation.priceRequired")),
    description: z.string().nullable().optional(),
    shortDescription: z.string().nullable().optional(),
    images: z.array(z.url(t("validation.invalidUrl"))).default([]),
    brandId: z.uuid(t("validation.invalidBrand")).nullable().optional(),
    categoryId: z.uuid(t("validation.invalidCategory")).nullable().optional(),
    specs: productSpecsSchema.nullable().optional(),
    isQuoteOnly: z.boolean().default(false),
  });

export const updateProductSchema = (t: IProductTranslator) =>
  createProductSchema(t).partial();

export type TProductSpecs = z.infer<typeof productSpecsSchema>;

export type TCreateProductInput = z.infer<
  ReturnType<typeof createProductSchema>
>;

export type TUpdateProductInput = z.infer<
  ReturnType<typeof updateProductSchema>
>;
