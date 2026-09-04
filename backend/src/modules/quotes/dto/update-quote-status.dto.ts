import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import {
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@/database/schemas/enums.schema";

export const updateQuoteStatusSchema = z.object({
  status: z.enum(QUOTE_STATUSES),
});

export type UpdateQuoteStatusDtoType = z.infer<typeof updateQuoteStatusSchema>;

export class UpdateQuoteStatusDto implements UpdateQuoteStatusDtoType {
  public static readonly zodSchema = updateQuoteStatusSchema;

  @ApiProperty({
    example: "APPROVED",
    enum: QUOTE_STATUSES,
    description: "Target quotation workflow status",
  })
  public status!: QuoteStatus;
}
