import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const brandTranslationInputSchema = z.object({
  locale: z.string().min(2).max(8),
  description: zSanitizedString({ max: 2000 }).nullish(),
});

export const createBrandBaseSchema = z.object({
  name: zSanitizedString({ min: 2, max: 255 }),
  slug: z
    .string(i18nZodMsg("validation.isString"))
    .min(2, { message: i18nZodMsg("validation.minLength", { "0": 2 }) })
    .max(255, { message: i18nZodMsg("validation.maxLength", { "0": 255 }) })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: i18nZodMsg("validation.matches"),
    }),
  logo: zSanitizedString({ max: 500 }).nullish(),
  translations: z.array(brandTranslationInputSchema).optional(),
  isActive: z.boolean().default(true),
});

export const createBrandSchema = createBrandBaseSchema.strict();

export type CreateBrandDtoType = z.infer<typeof createBrandSchema>;

export class CreateBrandDto extends createZodDto(createBrandSchema) {
  public static readonly zodSchema = createBrandSchema;
}
