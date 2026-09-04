import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const guestCartItemSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    quantity: z.number().int().min(1).max(1000),
  })
  .strict();

export type GuestCartItemDtoType = z.infer<typeof guestCartItemSchema>;

export class GuestCartItemDto implements GuestCartItemDtoType {
  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Product UUID from guest session",
  })
  public productId!: string;

  @ApiProperty({
    example: 2,
    description: "Item quantity accumulated in guest session",
    minimum: 1,
    maximum: 1000,
  })
  public quantity!: number;
}

export const mergeCartSchema = z
  .object({
    items: z.array(guestCartItemSchema).max(50),
  })
  .strict();

export type MergeCartDtoType = z.infer<typeof mergeCartSchema>;

export class MergeCartDto implements MergeCartDtoType {
  public static readonly zodSchema = mergeCartSchema;

  @ApiProperty({
    type: [GuestCartItemDto],
    description:
      "List of guest cart items to merge into authenticated user cart",
  })
  public items!: GuestCartItemDto[];
}
