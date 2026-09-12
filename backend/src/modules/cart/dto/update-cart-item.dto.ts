import { z } from "zod";
import { createZodDto } from "@/common/dto";

export const updateCartItemSchema = z
  .object({
    quantity: z.number().int().min(1).max(1000),
  })
  .strict();

export type UpdateCartItemDtoType = z.infer<typeof updateCartItemSchema>;

export class UpdateCartItemDto extends createZodDto(updateCartItemSchema) {
  public static readonly zodSchema = updateCartItemSchema;
}
