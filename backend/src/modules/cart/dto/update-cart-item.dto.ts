import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const updateCartItemSchema = z
  .object({
    quantity: z.number().int().min(1).max(1000),
  })
  .strict();

export type UpdateCartItemDtoType = z.infer<typeof updateCartItemSchema>;

export class UpdateCartItemDto implements UpdateCartItemDtoType {
  public static readonly zodSchema = updateCartItemSchema;

  @ApiProperty({
    example: 3,
    description: "New desired item quantity (min 1, max 1000)",
    minimum: 1,
    maximum: 1000,
  })
  public quantity!: number;
}
