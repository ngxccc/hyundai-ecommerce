import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString } from "@/common/schemas/zod-primitives";

export const sendQuoteMessageSchema = z.object({
  message: zSanitizedString({ min: 1 }),
});

export type SendQuoteMessageDtoType = z.infer<typeof sendQuoteMessageSchema>;

export class SendQuoteMessageDto extends createZodDto(sendQuoteMessageSchema) {}
