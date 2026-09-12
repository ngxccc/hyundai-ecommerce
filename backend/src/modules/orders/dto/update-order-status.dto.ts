import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { ORDER_STATUSES } from "@/database/schemas/enums.schema";

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: zSanitizedString({ max: 500 }).optional().nullable(),
});

export type UpdateOrderStatusDtoType = z.infer<typeof updateOrderStatusSchema>;

export class UpdateOrderStatusDto extends createZodDto(
  updateOrderStatusSchema,
) {}
