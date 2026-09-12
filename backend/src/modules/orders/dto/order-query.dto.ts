import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zCoerceDate } from "@/common/schemas/zod-primitives";
import {
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
} from "@/database/schemas/enums.schema";

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(ORDER_PAYMENT_STATUSES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  userId: z.uuid().optional(),
  customerPhone: z.string().optional(),
  search: z.string().optional(),
  startDate: zCoerceDate().optional(),
  endDate: zCoerceDate().optional(),
});

export type OrderQueryDtoType = z.infer<typeof orderQuerySchema>;
export class OrderQueryDto extends createZodDto(orderQuerySchema) {}
