import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { leadStatusEnum } from "@/database/schemas/enums.schema";

export const leadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(leadStatusEnum.enumValues).optional(),
  search: z.string().trim().optional(),
});

export type LeadQueryDtoType = z.infer<typeof leadQuerySchema>;

export class LeadQueryDto extends createZodDto(leadQuerySchema) {
  public static readonly zodSchema = leadQuerySchema;
}
