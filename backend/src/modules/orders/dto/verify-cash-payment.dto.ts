import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const verifyCashPaymentSchema = z.object({
  amount: z.union([
    z.number().positive({ message: i18nZodMsg("validation.isPositive") }),
    z.string().regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    }),
  ]),
  note: zSanitizedString({ max: 500 }).optional().nullable(),
});

export type VerifyCashPaymentDtoType = z.infer<typeof verifyCashPaymentSchema>;

export class VerifyCashPaymentDto extends createZodDto(
  verifyCashPaymentSchema,
) {}
