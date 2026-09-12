import { z } from "zod";
import { createZodDto } from "@/common/dto";

export const dealerTierResponseSchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  nameEn: z.string().nullable(),
  discountPercentage: z.string(),
  minimumSpend: z.string(),
});

export type DealerTierResponseDtoType = z.infer<
  typeof dealerTierResponseSchema
>;

export class DealerTierResponseDto extends createZodDto(
  dealerTierResponseSchema,
) {}
