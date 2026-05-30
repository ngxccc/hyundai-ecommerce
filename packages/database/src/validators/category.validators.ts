import { z } from "zod";

export type TCategoryValidationMessageKey =
  | "validation.nameRequired"
  | "validation.slugRequired"
  | "validation.invalidUrl"
  | "validation.invalidParent";

export type ICategoryTranslator = (
  key: TCategoryValidationMessageKey,
) => string;

export const getCreateCategorySchema = (t: ICategoryTranslator) =>
  z.object({
    name: z.string().min(1, { message: t("validation.nameRequired") }),
    slug: z.string().min(1, { message: t("validation.slugRequired") }),
    parentId: z.uuid({ message: t("validation.invalidParent") }).nullish(),
    description: z.string().optional().or(z.literal("")).nullable(),
    image: z
      .url({ message: t("validation.invalidUrl") })
      .optional()
      .or(z.literal(""))
      .nullable(),
    isActive: z.boolean().default(true),
  });

export const getUpdateCategorySchema = (t: ICategoryTranslator) =>
  getCreateCategorySchema(t).partial().extend({
    id: z.uuid(),
  });

export type TCreateCategoryInput = z.infer<
  ReturnType<typeof getCreateCategorySchema>
>;
export type TUpdateCategoryInput = z.infer<
  ReturnType<typeof getUpdateCategorySchema>
>;
