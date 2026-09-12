import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const guestCartItemSchema = z
  .object({
    productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
    quantity: z.number().int().min(1).max(1000),
  })
  .strict();

export const mergeCartSchema = z
  .object({
    items: z.array(guestCartItemSchema).max(50),
  })
  .strict();

export type GuestCartItemDtoType = z.infer<typeof guestCartItemSchema>;
export type MergeCartDtoType = z.infer<typeof mergeCartSchema>;

export class GuestCartItemDto extends createZodDto(guestCartItemSchema) {}

export class MergeCartDto extends createZodDto(mergeCartSchema) {
  public static readonly zodSchema = mergeCartSchema;
}
