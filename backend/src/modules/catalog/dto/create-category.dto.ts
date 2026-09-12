import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const categoryTranslationInputSchema = z.object({
  locale: z.string().min(2).max(8),
  name: zSanitizedString({ min: 2, max: 255 }),
  description: zSanitizedString({ max: 2000 }).nullish(),
});

export const createCategoryBaseSchema = z.object({
  slug: z
    .string(i18nZodMsg("validation.isString"))
    .min(2, { message: i18nZodMsg("validation.minLength", { "0": 2 }) })
    .max(255, { message: i18nZodMsg("validation.maxLength", { "0": 255 }) })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: i18nZodMsg("validation.matches"),
    }),
  parentId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
  image: zSanitizedString({ max: 500 }).nullish(),
  isActive: z.boolean().default(true),
  translations: z.array(categoryTranslationInputSchema).optional(),
  nameVi: zSanitizedString({ min: 2, max: 255 }).optional(),
  nameEn: zSanitizedString({ max: 255 }).nullish(),
  descriptionVi: zSanitizedString({ max: 2000 }).nullish(),
  descriptionEn: zSanitizedString({ max: 2000 }).nullish(),
});

export const createCategorySchema = createCategoryBaseSchema.strict().refine(
  (data) => {
    const hasViTranslation = data.translations?.some(
      (t) => t.locale === "vi" && t.name.trim().length > 0,
    );
    const hasLegacyVi =
      typeof data.nameVi === "string" && data.nameVi.trim().length > 0;
    return (hasViTranslation ?? false) || hasLegacyVi;
  },
  {
    message: "Vietnamese (vi) translation or nameVi is required",
    path: ["translations"],
  },
);

export type CreateCategoryDtoType = z.infer<typeof createCategorySchema>;

export class CreateCategoryDto extends createZodDto(createCategorySchema) {
  public static readonly zodSchema = createCategorySchema;
}
