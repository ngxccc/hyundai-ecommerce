import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { PAYMENT_METHODS } from "@/database/schemas/enums.schema";

export const repayDebtSchema = z.object({
  userId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  amount: z.union([
    z.number().positive({ message: i18nZodMsg("validation.isPositive") }),
    z.string().regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    }),
  ]),
  paymentMethod: z
    .enum(PAYMENT_METHODS, { message: i18nZodMsg("validation.isIn") })
    .default("PAYOS"),
  note: zSanitizedString({ max: 500 }).optional().nullable(),
  returnUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export type RepayDebtDtoType = z.infer<typeof repayDebtSchema>;

export class RepayDebtDto extends createZodDto(repayDebtSchema) {}
