import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";

export const sendQuoteMessageSchema = z.object({
  message: zSanitizedString({ min: 1 }),
});

export type SendQuoteMessageDto = z.infer<typeof sendQuoteMessageSchema>;
