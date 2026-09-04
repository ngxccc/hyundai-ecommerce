import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const addCartItemSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    quantity: z.number().int().min(1).max(1000).default(1),
  })
  .strict();

export type AddCartItemDtoType = z.infer<typeof addCartItemSchema>;

export class AddCartItemDto implements AddCartItemDtoType {
  public static readonly zodSchema = addCartItemSchema;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "Product UUID to add to cart",
  })
  public productId!: string;

  @ApiProperty({
    example: 1,
    default: 1,
    description: "Quantity of items to add (min 1)",
    minimum: 1,
    maximum: 1000,
  })
  public quantity!: number;
}
