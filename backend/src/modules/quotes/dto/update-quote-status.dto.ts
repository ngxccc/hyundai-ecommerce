import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { QUOTE_STATUSES } from "@/database/schemas/enums.schema";

export const updateQuoteStatusSchema = z.object({
  status: z.enum(QUOTE_STATUSES),
});

export type UpdateQuoteStatusDtoType = z.infer<typeof updateQuoteStatusSchema>;

export class UpdateQuoteStatusDto extends createZodDto(
  updateQuoteStatusSchema,
) {}
