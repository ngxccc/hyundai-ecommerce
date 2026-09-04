import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  type OrderStatus,
  type OrderPaymentStatus,
  type PaymentMethod,
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
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type OrderQueryDtoType = z.infer<typeof orderQuerySchema>;

export class OrderQueryDto implements OrderQueryDtoType {
  public static readonly zodSchema = orderQuerySchema;

  @ApiPropertyOptional({ example: 1, default: 1 })
  public page = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  public limit = 20;

  @ApiPropertyOptional({ enum: ORDER_STATUSES })
  public status?: OrderStatus;

  @ApiPropertyOptional({ enum: ORDER_PAYMENT_STATUSES })
  public paymentStatus?: OrderPaymentStatus;

  @ApiPropertyOptional({ enum: PAYMENT_METHODS })
  public paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb91" })
  public userId?: string;

  @ApiPropertyOptional({ example: "0901234567" })
  public customerPhone?: string;

  @ApiPropertyOptional({ example: "ORD-20260904" })
  public search?: string;

  @ApiPropertyOptional({ example: "2026-09-01T00:00:00.000Z" })
  public startDate?: Date;

  @ApiPropertyOptional({ example: "2026-09-30T23:59:59.000Z" })
  public endDate?: Date;
}
