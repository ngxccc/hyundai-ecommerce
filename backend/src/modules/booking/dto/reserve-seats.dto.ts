import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zUuidV7 } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Validation schema for seat reservation requests.
 */
export const reserveSeatsSchema = z
  .object({
    showId: zUuidV7(),
    seatIds: z
      .array(zUuidV7())
      .min(1, i18nZodMsg("validation.isNotEmpty"))
      .max(6, i18nZodMsg("validation.maxLength", { "0": 6 })),
    voucherCode: z.string(i18nZodMsg("validation.isString")).optional(),
  })
  .strict();

export type ReserveSeatsDtoType = z.infer<typeof reserveSeatsSchema>;

/**
 * Data Transfer Object for reserving and locking cinema seats.
 */
export class ReserveSeatsDto implements ReserveSeatsDtoType {
  public static readonly zodSchema = reserveSeatsSchema;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    description: "UUIDv7 of the scheduled movie show",
  })
  public showId!: string;

  @ApiProperty({
    example: [
      "019fa8bc-8f4d-7000-b366-e691f45cfb01",
      "019fa8bc-8f4d-7000-b366-e691f45cfb02",
    ],
    description: "Array of 1 to 6 seat UUIDv7s to reserve and lock",
  })
  public seatIds!: string[];

  @ApiProperty({
    example: "DISCOUNT50",
    description: "Optional promotion or voucher code",
    required: false,
  })
  public voucherCode?: string;
}

export class ReserveSeatsResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public bookingId!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public showId!: string;

  @ApiProperty({ example: 100000 })
  public totalPrice!: number;

  @ApiProperty({ example: "pending_payment" })
  public status!: string;

  @ApiProperty({ example: "2026-07-28T12:45:00.000Z" })
  public expiresAt!: string;

  @ApiProperty({ example: ["019fa8bc-8f4d-7000-b366-e691f45cfb8f"] })
  public seats!: string[];
}
