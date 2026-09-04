import { z } from "zod";
import { QUOTE_STATUSES } from "@/database/schemas/enums.schema";

export const quoteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.uuid().optional(),
  status: z.enum(QUOTE_STATUSES).optional(),
  search: z.string().optional(),
});

export type QuoteQueryDto = z.infer<typeof quoteQuerySchema>;
