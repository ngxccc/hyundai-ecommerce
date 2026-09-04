import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { LEAD_STATUSES, type LeadStatus } from "@/database/schemas";

export const updateLeadStatusSchema = z
  .object({
    status: z.enum(LEAD_STATUSES),
    lostReason: zSanitizedString({ min: 2, max: 1000 }).optional(),
  })
  .strict();

export type UpdateLeadStatusDtoType = z.infer<typeof updateLeadStatusSchema>;

export class UpdateLeadStatusDto implements UpdateLeadStatusDtoType {
  public static readonly zodSchema = updateLeadStatusSchema;

  @ApiProperty({
    example: "CONTACTING",
    enum: LEAD_STATUSES,
    description: "New pipeline status of the lead",
  })
  public status!: LeadStatus;

  @ApiProperty({
    example: "Khách chê giá đắt, đã chọn phương án thuê máy cũ",
    description: "Reason when status is REJECTED or LOST",
    required: false,
  })
  public lostReason?: string;
}
