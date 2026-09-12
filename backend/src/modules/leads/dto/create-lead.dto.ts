import { z } from "zod";
import { createZodDto } from "@/common/dto";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const createLeadItemSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    quantity: z
      .number()
      .int({ message: i18nZodMsg("validation.isInt") })
      .positive({ message: i18nZodMsg("validation.isPositive") })
      .default(1),
  })
  .strict();

export type CreateLeadItemDtoType = z.infer<typeof createLeadItemSchema>;

export class CreateLeadItemDto extends createZodDto(createLeadItemSchema) {}

export const createLeadSchema = z
  .object({
    fullName: zSanitizedString({ min: 2, max: 255 }),
    phoneNumber: zPhoneNumber(),
    email: zEmail().optional(),
    companyName: zSanitizedString({ min: 1, max: 255 }).optional(),
    city: zSanitizedString({ min: 2, max: 100 }),
    ward: zSanitizedString({ min: 2, max: 100 }),
    streetAddress: zSanitizedString({ min: 1, max: 255 }).optional(),
    notes: zSanitizedString({ min: 1, max: 2000 }).optional(),
    items: z
      .array(createLeadItemSchema)
      .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
  })
  .strict();

export type CreateLeadDtoType = z.infer<typeof createLeadSchema>;

export class CreateLeadDto extends createZodDto(createLeadSchema) {
  public static readonly zodSchema = createLeadSchema;
}
