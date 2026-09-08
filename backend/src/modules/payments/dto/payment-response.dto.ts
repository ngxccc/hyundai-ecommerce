import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  DEBT_REPAYMENT_STATUSES,
  ORDER_PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_TRANSACTION_STATUSES,
  PAYMENT_TRANSACTION_TYPES,
  type DebtRepaymentStatus,
  type OrderPaymentStatus,
  type PaymentMethod,
  type PaymentTransactionStatus,
  type PaymentTransactionType,
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

  @ApiProperty({ example: PAYMENT_METHODS[0], enum: PAYMENT_METHODS })
  public paymentMethod!: PaymentMethod;

  @ApiProperty({
    example: PAYMENT_TRANSACTION_TYPES[0],
    enum: PAYMENT_TRANSACTION_TYPES,
  })
  public transactionType!: PaymentTransactionType;

  @ApiProperty({
    example: PAYMENT_TRANSACTION_STATUSES[0],
    enum: PAYMENT_TRANSACTION_STATUSES,
  })
  public status!: PaymentTransactionStatus;

  @ApiPropertyOptional({ example: 1725451234567, nullable: true })
  public orderCode?: number | null;

  @ApiPropertyOptional({ example: "REF-123456", nullable: true })
  public referenceCode?: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb93",
    nullable: true,
  })
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

  @ApiProperty({ example: PAYMENT_METHODS[0], enum: PAYMENT_METHODS })
  public paymentMethod!: PaymentMethod;

  @ApiProperty({
    example: DEBT_REPAYMENT_STATUSES[0],
    enum: DEBT_REPAYMENT_STATUSES,
  })
  public status!: DebtRepaymentStatus;

  @ApiPropertyOptional({ example: 1725451234568, nullable: true })
  public orderCode?: number | null;

  @ApiPropertyOptional({ example: "REPAY-REF-789", nullable: true })
  public referenceCode?: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb93",
    nullable: true,
  })
  public verifiedBy?: string | null;

  @ApiPropertyOptional({
    example: "https://pay.payos.vn/web/6c9b3a6e7a2e7b56b74c419b4eb14b9a",
    nullable: true,
  })
  public checkoutUrl?: string | null;

  @ApiPropertyOptional({
    example: "00020101021238540010A00000072701260006970422...",
    nullable: true,
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

  @ApiPropertyOptional({ example: "ORD-20260904-4821", nullable: true })
  public orderNumber?: string | null;
  @ApiProperty({ example: "490000000.00" })
  public totalAmount!: string;

  @ApiPropertyOptional({ example: "0.00", nullable: true })
  public depositAmount?: string | null;

  @ApiPropertyOptional({ example: "0.00", nullable: true })
  public remainingAmount?: string | null;
  @ApiProperty({ example: PAYMENT_METHODS[0], enum: PAYMENT_METHODS })
  public paymentMethod!: PaymentMethod;

  @ApiProperty({
    example: ORDER_PAYMENT_STATUSES[2],
    enum: ORDER_PAYMENT_STATUSES,
  })
  public paymentStatus!: OrderPaymentStatus;

  @ApiProperty({
    type: () => [PaymentTransactionResponseDto],
    description: "List of related payment transactions",
  })
  public transactions!: PaymentTransactionResponseDto[];
}
