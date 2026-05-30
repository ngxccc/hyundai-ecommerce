import { z } from "zod";

export type TBrandValidationMessageKey =
  | "validation.nameRequired"
  | "validation.slugRequired"
  | "validation.invalidUrl";

export type IBrandTranslator = (key: TBrandValidationMessageKey) => string;

export const getCreateBrandSchema = (t: IBrandTranslator) =>
  z.object({
    name: z.string().min(1, { message: t("validation.nameRequired") }),
    slug: z.string().min(1, { message: t("validation.slugRequired") }),
    logo: z
      .url({ message: t("validation.invalidUrl") })
      .optional()
      .or(z.literal(""))
      .nullable(),
    description: z.string().optional().or(z.literal("")).nullable(),
    isActive: z.boolean().default(true),
  });

export const getUpdateBrandSchema = (t: IBrandTranslator) =>
  getCreateBrandSchema(t).partial().extend({
    id: z.uuid(),
  });

export type TCreateBrandInput = z.infer<
  ReturnType<typeof getCreateBrandSchema>
>;
export type TUpdateBrandInput = z.infer<
  ReturnType<typeof getUpdateBrandSchema>
>;
