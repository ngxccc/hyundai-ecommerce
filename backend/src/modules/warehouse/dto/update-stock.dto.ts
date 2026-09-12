import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const updateStockSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    stock: z.number().int().min(0),
    minStockWarning: z.number().int().min(0).default(2),
  })
  .strict();

export type UpdateStockDtoType = z.infer<typeof updateStockSchema>;

export class UpdateStockDto extends createZodDto(updateStockSchema) {
  public static readonly zodSchema = updateStockSchema;
}
