import { z } from "zod";
import { createZodDto } from "@/common/dto";

export const dashboardAnalyticsQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2999).optional(),
  locale: z.string().min(2).max(8).default("vi").optional(),
});

export type DashboardAnalyticsQueryDtoType = z.infer<
  typeof dashboardAnalyticsQuerySchema
>;

export class DashboardAnalyticsQueryDto extends createZodDto(
  dashboardAnalyticsQuerySchema,
) {}
