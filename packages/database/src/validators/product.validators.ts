import { z } from "zod";
import { type JSONContent } from "@nhatnang/ui";

export type TProductValidationMessageKey =
  | "validation.nameRequired"
  | "validation.slugRequired"
  | "validation.priceRequired"
  | "validation.invalidUrl"
  | "validation.invalidBrand"
  | "validation.invalidCategory"
  | "validation.specKeyRequired"
  | "validation.specValueRequired"
  | "validation.invalidNumber";

export type IProductTranslator = (key: TProductValidationMessageKey) => string;

const createNumberField = (t: IProductTranslator) =>
  z
    .union([z.string(), z.number()])
    .nullish()
    .transform((val, ctx) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      if (Number.isNaN(num)) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.invalidNumber"),
        });
        return z.NEVER;
      }
      return num;
    })
    .optional();

export const productSpecsSchema = (t: IProductTranslator) =>
  z
    .object({
      model: z.string().optional(),
      power: createNumberField(t), // Base Unit: KW
      voltage: createNumberField(t), // Base Unit: V
      frequency: createNumberField(t), // Base Unit: Hz
      phase: z.enum(["1phase", "3phase"]).optional(),
      engine: z.string().optional(),
      engineBrand: z.string().optional(),
      alternator: z.string().optional(),
      alternatorBrand: z.string().optional(),
      fuelType: z.enum(["diesel", "gasoline", "gas"]).optional(),
      fuelConsumption: createNumberField(t), // Base Unit: L/h
      fuelTankCapacity: createNumberField(t), // Base Unit: Lít
      weight: createNumberField(t), // Base Unit: KG
      length: createNumberField(t), // Base Unit: mm
      width: createNumberField(t), // Base Unit: mm
      height: createNumberField(t), // Base Unit: mm
      noiseLevel: createNumberField(t), // Base Unit: dB
      warranty: createNumberField(t), // Base Unit: Tháng
      ratedCurrent: createNumberField(t), // Base Unit: A
      powerFactor: createNumberField(t), // Base Unit: Hệ số (0.8 - 1.0)
      startingSystem: z.string().optional(),
      coolingSystem: z.string().optional(),
    })
    .catchall(z.union([z.string(), z.number(), z.boolean()]));

export const createProductSchema = (t: IProductTranslator) =>
  z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    slug: z.string().min(1, t("validation.slugRequired")),
    price: z.string().min(1, t("validation.priceRequired")),
    description: z.custom<JSONContent>().nullable().optional(),
    shortDescription: z.string().nullable().optional(),
    images: z.array(z.url(t("validation.invalidUrl"))),
    brandId: z.uuid(t("validation.invalidBrand")).nullable().optional(),
    categoryId: z.uuid(t("validation.invalidCategory")).nullable().optional(),
    specs: productSpecsSchema(t).nullable().optional(),
    isQuoteOnly: z.boolean(),
  });

export const updateProductSchema = (t: IProductTranslator) =>
  createProductSchema(t).partial();

export type TProductSpecs = z.infer<ReturnType<typeof productSpecsSchema>>;

export type TCreateProductInput = z.infer<
  ReturnType<typeof createProductSchema>
>;

export type TUpdateProductInput = z.infer<
  ReturnType<typeof updateProductSchema>
>;
