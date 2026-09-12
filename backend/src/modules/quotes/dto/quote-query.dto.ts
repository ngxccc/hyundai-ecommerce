import { z } from "zod";
import { createZodDto } from "@/common/dto";
import {
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@/database/schemas/enums.schema";

export const quoteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.uuid().optional(),
  status: z.enum(QUOTE_STATUSES).optional(),
  search: z.string().optional(),
});

export type QuoteQueryDtoType = z.infer<typeof quoteQuerySchema>;
export type { QuoteStatus };

export class QuoteQueryDto extends createZodDto(quoteQuerySchema) {}
