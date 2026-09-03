import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zUuidV7 } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import {
  paymentMethodEnum,
  type PaymentMethod,
} from "@/database/schemas/enums.schema";

/**
 * Validation schema for booking confirmation requests.
 */
export const confirmBookingSchema = z
  .object({
    bookingId: zUuidV7(),
    orderCode: z
      .number(i18nZodMsg("validation.isInt"))
      .int(i18nZodMsg("validation.isInt"))
      .positive(i18nZodMsg("validation.isPositive")),
    paymentMethod: z.enum(
      paymentMethodEnum.enumValues,
      i18nZodMsg("validation.isIn", {
        "0": paymentMethodEnum.enumValues.join(", "),
      }),
    ),
    transactionId: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, i18nZodMsg("validation.isNotEmpty")),
    amount: z
      .number(i18nZodMsg("validation.isInt"))
      .int(i18nZodMsg("validation.isInt"))
      .positive(i18nZodMsg("validation.isPositive")),
  })
  .strict();

export type ConfirmBookingDtoType = z.infer<typeof confirmBookingSchema>;

/**
 * Data Transfer Object for confirming a reserved booking with payment.
 */
export class ConfirmBookingDto implements ConfirmBookingDtoType {
  public static readonly zodSchema = confirmBookingSchema;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "UUIDv7 of the pending reservation to confirm",
  })
  public bookingId!: string;

  @ApiProperty({
    example: 123456,
    description: "PayOS unique numerical order code",
  })
  public orderCode!: number;

  @ApiProperty({
    example: "PAYOS",
    enum: ["PAYOS", "CASH", "VNPAY", "MOMO", "ZALOPAY"],
    description: "Payment method used for the transaction",
  })
  public paymentMethod!: PaymentMethod;

  @ApiProperty({
    example: "TXN-123456789",
    description: "External payment gateway transaction ID",
  })
  public transactionId!: string;

  @ApiProperty({
    example: 200000,
    description: "Actual paid amount in VND",
  })
  public amount!: number;
}

export class ConfirmedTicketDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public ticketId!: string;

  @ApiProperty({ example: "TKT-A1B2C3D4" })
  public ticketCode!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public showSeatId!: string;

  @ApiProperty({ example: 100000 })
  public finalPrice!: number;
}

export class ConfirmBookingResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public bookingId!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public paymentId!: string;

  @ApiProperty({ example: "PAYOS-TX-12345" })
  public transactionId!: string;

  @ApiProperty({ example: "confirmed" })
  public status!: "confirmed";

  @ApiProperty({ example: "2026-07-28T12:45:00.000Z" })
  public confirmedAt!: string;

  @ApiProperty({ example: 100000 })
  public totalPrice!: number;

  @ApiProperty({ type: [ConfirmedTicketDto] })
  public tickets!: ConfirmedTicketDto[];
}
