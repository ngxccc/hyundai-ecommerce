import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
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

export class QuoteQueryDto implements QuoteQueryDtoType {
  public static readonly zodSchema = quoteQuerySchema;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: "Pagination page number (1-based)",
  })
  public page = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: "Number of records per page (max 100)",
  })
  public limit = 20;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    description: "Filter quotes by customer/dealer user UUID",
  })
  public userId?: string;

  @ApiPropertyOptional({
    example: "PENDING",
    enum: QUOTE_STATUSES,
    description: "Filter quotes by status",
  })
  public status?: QuoteStatus;

  @ApiPropertyOptional({
    example: "Nam Á",
    description: "Search keyword matching quoteNumber, customer, or company",
  })
  public search?: string;
}
