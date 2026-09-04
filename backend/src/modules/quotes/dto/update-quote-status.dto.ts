import { z } from "zod";
import {
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@/database/schemas/enums.schema";

export const updateQuoteStatusSchema = z.object({
  status: z.enum(QUOTE_STATUSES),
});

export interface UpdateQuoteStatusDto {
  status: QuoteStatus;
}
