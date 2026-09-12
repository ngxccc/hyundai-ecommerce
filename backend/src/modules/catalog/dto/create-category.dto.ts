import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const createCategorySchema = z
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
    parentId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
    descriptionVi: zSanitizedString({ max: 2000 }).nullish(),
    descriptionEn: zSanitizedString({ max: 2000 }).nullish(),
    image: zSanitizedString({ max: 500 }).nullish(),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateCategoryDtoType = z.infer<typeof createCategorySchema>;

export class CreateCategoryDto extends createZodDto(createCategorySchema) {
  public static readonly zodSchema = createCategorySchema;
}
