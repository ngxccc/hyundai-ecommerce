import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { leadStatusEnum } from "@/database/schemas/enums.schema";

export const leadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(leadStatusEnum.enumValues).optional(),
  search: z.string().trim().optional(),
});

export type LeadQueryDtoType = z.infer<typeof leadQuerySchema>;

export class LeadQueryDto implements LeadQueryDtoType {
  public static readonly zodSchema = leadQuerySchema;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    default: 1,
    description: "Pagination page number (1-based)",
  })
  public page = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 20,
    default: 20,
    description: "Number of records per page (max 100)",
  })
  public limit = 20;

  @ApiPropertyOptional({
    enum: leadStatusEnum.enumValues,
    description: "Filter leads by operational status",
  })
  status?: (typeof leadStatusEnum.enumValues)[number];

  @ApiPropertyOptional({
    description: "Search across customerName, phoneNumber, companyName, notes",
  })
  search?: string;
}
