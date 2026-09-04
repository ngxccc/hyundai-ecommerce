import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  DEBT_REPAYMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_TRANSACTION_STATUSES,
  PAYMENT_TRANSACTION_TYPES,
} from "@/database/schemas/enums.schema";

export class CheckoutLinkResponseDto {
  @ApiProperty({
    example: "https://pay.payos.vn/web/6c9b3a6e7a2e7b56b74c419b4eb14b9a",
    description: "PayOS checkout redirect web URL",
  })
  public checkoutUrl!: string;

  @ApiProperty({
    example: "00020101021238540010A00000072701260006970422...",
    description: "VietQR EMV payload or QR code data string",
  })
  public qrCode!: string;

  @ApiProperty({
    example: 1725451234567,
    description: "Unique PayOS order code identifier",
  })
  public orderCode!: number;

  @ApiProperty({
    example: 490000000,
    description: "Payable amount in VND",
  })
  public amount!: number;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
    description: "PayOS payment link ID",
  })
  public paymentLinkId!: string;
}

export class PaymentTransactionResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb91" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb92" })
  public orderId!: string;

  @ApiProperty({ example: "490000000.00" })
  public amount!: string;

  @ApiProperty({ example: "PAYOS", enum: PAYMENT_METHODS })
  public paymentMethod!: string;

  @ApiProperty({ example: "FULL_PAYMENT", enum: PAYMENT_TRANSACTION_TYPES })
  public transactionType!: string;

  @ApiProperty({ example: "PENDING", enum: PAYMENT_TRANSACTION_STATUSES })
  public status!: string;

  @ApiPropertyOptional({ example: 1725451234567 })
  public orderCode?: number | null;

  @ApiPropertyOptional({ example: "REF-123456" })
  public referenceCode?: string | null;

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb93" })
  public verifiedBy?: string | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}

export class DebtRepaymentResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb91" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public userId!: string;

  @ApiProperty({ example: "50000000.00" })
  public amount!: string;

  @ApiProperty({ example: "PAYOS", enum: PAYMENT_METHODS })
  public paymentMethod!: string;

  @ApiProperty({ example: "PENDING", enum: DEBT_REPAYMENT_STATUSES })
  public status!: string;

  @ApiPropertyOptional({ example: 1725451234568 })
  public orderCode?: number | null;

  @ApiPropertyOptional({ example: "REPAY-REF-789" })
  public referenceCode?: string | null;

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb93" })
  public verifiedBy?: string | null;

  @ApiPropertyOptional({
    example: "https://pay.payos.vn/web/6c9b3a6e7a2e7b56b74c419b4eb14b9a",
  })
  public checkoutUrl?: string | null;

  @ApiPropertyOptional({
    example: "00020101021238540010A00000072701260006970422...",
  })
  public qrCode?: string | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}

export class OrderPaymentSummaryDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb92" })
  public orderId!: string;

  @ApiPropertyOptional({ example: "ORD-20260904-4821" })
  public orderNumber?: string | null;

  @ApiProperty({ example: "490000000.00" })
  public totalAmount!: string;

  @ApiPropertyOptional({ example: "0.00" })
  public depositAmount?: string | null;

  @ApiPropertyOptional({ example: "0.00" })
  public remainingAmount?: string | null;

  @ApiProperty({ example: "PAYOS" })
  public paymentMethod!: string;

  @ApiProperty({ example: "FULLY_PAID" })
  public paymentStatus!: string;

  @ApiProperty({
    type: () => [PaymentTransactionResponseDto],
    description: "List of related payment transactions",
  })
  public transactions!: PaymentTransactionResponseDto[];
}
