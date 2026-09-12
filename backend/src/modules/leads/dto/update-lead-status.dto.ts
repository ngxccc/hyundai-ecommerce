import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { LEAD_STATUSES } from "@/database/schemas";

export const updateLeadStatusSchema = z
  .object({
    status: z.enum(LEAD_STATUSES),
    lostReason: zSanitizedString({ min: 2, max: 1000 }).optional(),
  })
  .strict();

export type UpdateLeadStatusDtoType = z.infer<typeof updateLeadStatusSchema>;

export class UpdateLeadStatusDto extends createZodDto(updateLeadStatusSchema) {
  public static readonly zodSchema = updateLeadStatusSchema;
}
