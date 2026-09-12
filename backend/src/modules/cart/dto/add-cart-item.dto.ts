import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const addCartItemSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    quantity: z.number().int().min(1).max(1000).default(1),
  })
  .strict();

export type AddCartItemDtoType = z.infer<typeof addCartItemSchema>;

export class AddCartItemDto extends createZodDto(addCartItemSchema) {
  public static readonly zodSchema = addCartItemSchema;
}
