import { z } from "zod";
import { createZodDto } from "@/common/dto";

export const monthlyRevenueItemSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  revenue: z.number(),
  orders: z.number().int(),
});

export const categoryDistributionItemSchema = z.object({
  category: z.string(),
  revenue: z.number(),
  share: z.number(),
});

export const topProductItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sold: z.number().int(),
  price: z.string(),
  image: z.string().optional(),
});

export const dashboardMetricsSchema = z.object({
  totalRevenue: z.number(),
  totalOrders: z.number().int(),
  averageOrderValue: z.number(),
  newCustomers: z.number().int(),
  revenueGrowth: z.number(),
  ordersGrowth: z.number(),
  aovGrowth: z.number(),
  customersGrowth: z.number(),
});

export const dashboardAnalyticsResponseSchema = z.object({
  year: z.number().int(),
  metrics: dashboardMetricsSchema,
  monthlyRevenue: z.array(monthlyRevenueItemSchema),
  categoryDistribution: z.array(categoryDistributionItemSchema),
  topProducts: z.array(topProductItemSchema),
});

export type DashboardAnalyticsResponseDtoType = z.infer<
  typeof dashboardAnalyticsResponseSchema
>;

export class DashboardAnalyticsResponseDto extends createZodDto(
  dashboardAnalyticsResponseSchema,
) {}
