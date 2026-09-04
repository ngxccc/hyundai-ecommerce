import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";

export const sendQuoteMessageSchema = z.object({
  message: zSanitizedString({ min: 1 }),
});

export type SendQuoteMessageDtoType = z.infer<typeof sendQuoteMessageSchema>;

export class SendQuoteMessageDto implements SendQuoteMessageDtoType {
  public static readonly zodSchema = sendQuoteMessageSchema;

  @ApiProperty({
    example:
      "Chúng tôi đề xuất chiết khấu thêm 2% nếu quý khách lấy số lượng từ 5 máy trở lên.",
    description: "Negotiation message content",
  })
  public message!: string;
}
