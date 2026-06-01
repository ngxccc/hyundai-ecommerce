import { z } from "zod";

export type TDealerTierValidationMessageKey =
  | "validation.tierNameRequired"
  | "validation.discountPercentageRequired"
  | "validation.discountPercentageBounds"
  | "validation.minimumSpendBounds";

export type IDealerTierTranslator = (key: TDealerTierValidationMessageKey) => string;

export const getCreateDealerTierSchema = (t: IDealerTierTranslator) =>
  z.object({
    name: z.string().min(1, { message: t("validation.tierNameRequired") }),
    discountPercentage: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, { message: t("validation.discountPercentageBounds") }),
    minimumSpend: z
      .string()
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, { message: t("validation.minimumSpendBounds") })
      .default("0"),
  });

export const getUpdateDealerTierSchema = (t: IDealerTierTranslator) =>
  getCreateDealerTierSchema(t).partial().extend({
    id: z.uuid(),
  });

export type TCreateDealerTierInput = z.infer<
  ReturnType<typeof getCreateDealerTierSchema>
>;
export type TUpdateDealerTierInput = z.infer<
  ReturnType<typeof getUpdateDealerTierSchema>
>;
