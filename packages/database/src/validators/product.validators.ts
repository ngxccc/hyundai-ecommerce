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
    power: z.coerce.number().optional(), // Base Unit: KW
    voltage: z.coerce.number().optional(), // Base Unit: V
    frequency: z.coerce.number().optional(), // Base Unit: Hz
    phase: z.enum(["1phase", "3phase"]).optional(),
    engine: z.string().optional(),
    engineBrand: z.string().optional(),
    alternator: z.string().optional(),
    alternatorBrand: z.string().optional(),
    fuelType: z.enum(["diesel", "gasoline", "gas"]).optional(),
    fuelConsumption: z.coerce.number().optional(), // Base Unit: L/h
    fuelTankCapacity: z.coerce.number().optional(), // Base Unit: Lít
    weight: z.coerce.number().optional(), // Base Unit: KG
    length: z.coerce.number().optional(), // Base Unit: mm
    width: z.coerce.number().optional(), // Base Unit: mm
    height: z.coerce.number().optional(), // Base Unit: mm
    noiseLevel: z.coerce.number().optional(), // Base Unit: dB
    warranty: z.coerce.number().optional(), // Base Unit: Tháng
    ratedCurrent: z.coerce.number().optional(), // Base Unit: A
    powerFactor: z.coerce.number().optional(), // Base Unit: Hệ số (0.8 - 1.0)
    startingSystem: z.string().optional(),
    coolingSystem: z.string().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.boolean()]));

export const createProductSchema = (t: IProductTranslator) =>
  z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    slug: z.string().min(1, t("validation.slugRequired")),
    price: z.string().min(1, t("validation.priceRequired")),
    description: z.record(z.string(), z.any()).nullable().optional(),
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
