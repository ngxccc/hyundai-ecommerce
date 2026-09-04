import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { ORDER_STATUSES } from "@/database/schemas/enums.schema";

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: zSanitizedString({ max: 500 }).optional().nullable(),
});

export type UpdateOrderStatusDtoType = z.infer<typeof updateOrderStatusSchema>;

export class UpdateOrderStatusDto implements UpdateOrderStatusDtoType {
  public static readonly zodSchema = updateOrderStatusSchema;

  @ApiProperty({
    example: "CONFIRMED",
    enum: ORDER_STATUSES,
    description: "New order status along the state machine",
  })
  public status!: (typeof ORDER_STATUSES)[number];

  @ApiPropertyOptional({
    example: "Đã xác nhận thanh toán chuyển khoản và sẵn sàng đóng gói",
    description: "Reason or operational note for status change",
  })
  public note?: string | null;
}
