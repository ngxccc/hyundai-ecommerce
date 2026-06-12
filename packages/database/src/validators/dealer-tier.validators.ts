import { z } from "zod";

export const createDealerTierSchema = z
  .object({
    nameVi: z.string().min(1, "validation.tierNameRequired"),
    nameEn: z.string().optional().or(z.literal("")).nullable(),
    discountPercentage: z.string().refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      { message: "validation.discountPercentageBounds" },
    ),
    minimumSpend: z
      .string()
      .refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0;
        },
        { message: "validation.minimumSpendBounds" },
      )
      .default("0"),
  })
  .strict();

export const updateDealerTierSchema = createDealerTierSchema
  .partial()
  .extend({
    id: z.uuid("validation.invalidId"),
  })
  .strict();

export type TCreateDealerTierInput = z.infer<typeof createDealerTierSchema>;
export type TUpdateDealerTierInput = z.infer<typeof updateDealerTierSchema>;