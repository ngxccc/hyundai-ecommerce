import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  APPROVAL_STATUSES,
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  type ApprovalStatus,
  type OrderPaymentStatus,
  type OrderStatus,
  type PaymentMethod,
} from "@/database/schemas/enums.schema";

export class OrderItemProductSummaryDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha" })
  public nameVi!: string;

  @ApiPropertyOptional({
    example: "Hyundai DHY65KSE 60kVA 3 Phase Diesel Generator",
  })
  public nameEn?: string | null;

  @ApiProperty({
    example: "may-phat-dien-diesel-hyundai-dhy65kse-60kva-3-pha",
  })
  public slug!: string;

  @ApiProperty({ example: "245000000.00" })
  public price!: string;

  @ApiProperty({ example: ["https://res.cloudinary.com/hyundai/image.jpg"] })
  public images!: string[];

  @ApiProperty({ example: 5 })
  public totalStockCache!: number;
}

export class OrderItemResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb91" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb92" })
  public orderId!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public productId!: string;

  @ApiProperty({ example: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha" })
  public productName!: string;

  @ApiProperty({ example: "DHY65KSE" })
  public productSku!: string;

  @ApiProperty({ example: 1 })
  public quantity!: number;

  @ApiProperty({ example: "245000000.00" })
  public unitPrice!: string;

  @ApiPropertyOptional({ type: () => OrderItemProductSummaryDto })
  public product?: OrderItemProductSummaryDto | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}

export class OrderUserSummaryDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public id!: string;

  @ApiProperty({ example: "Nguyễn Văn Đại Lý" })
  public fullName!: string;

  @ApiProperty({ example: "dealer@example.com" })
  public email!: string;

  @ApiProperty({ example: "0911223344" })
  public phoneNumber!: string;

  @ApiProperty({ example: "SALES" })
  public role!: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb92" })
  public id!: string;

  @ApiPropertyOptional({ example: "ORD-20260904-4821" })
  public orderNumber?: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
  })
  public userId?: string | null;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
  })
  public leadId?: string | null;
  @ApiPropertyOptional({ example: "Nguyễn Văn A" })
  public customerName?: string | null;

  @ApiPropertyOptional({ example: "0901234567" })
  public customerPhone?: string | null;

  @ApiPropertyOptional({ example: "nguyenvana@example.com" })
  public customerEmail?: string | null;

  @ApiPropertyOptional({ example: "Công ty Cổ phần Xây Dựng Số 1" })
  public companyName?: string | null;

  @ApiProperty({
    example: "PENDING",
    enum: ORDER_STATUSES,
  })
  public status!: OrderStatus;

  @ApiProperty({ example: "500000.00" })
  public shippingFee!: string;

  @ApiProperty({ example: "Kho số 4, Cảng Tiên Sa, TP. Đà Nẵng" })
  public shippingAddress!: string;

  @ApiProperty({ example: "245500000.00" })
  public totalAmount!: string;

  @ApiPropertyOptional({ example: "50000000.00" })
  public depositAmount?: string | null;

  @ApiPropertyOptional({ example: "195500000.00" })
  public remainingAmount?: string | null;

  @ApiProperty({
    example: "PAYOS",
    enum: PAYMENT_METHODS,
  })
  public paymentMethod!: PaymentMethod;

  @ApiProperty({
    example: "PENDING",
    enum: ORDER_PAYMENT_STATUSES,
  })
  public paymentStatus!: OrderPaymentStatus;

  @ApiProperty({
    example: "APPROVED",
    enum: APPROVAL_STATUSES,
  })
  public approvalStatus!: ApprovalStatus;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb9c",
  })
  public approvedBy?: string | null;

  @ApiPropertyOptional({ example: "Giao trong giờ hành chính" })
  public note?: string | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;

  @ApiProperty({ type: [OrderItemResponseDto] })
  public items!: OrderItemResponseDto[];

  @ApiPropertyOptional({ type: () => OrderUserSummaryDto })
  public user?: OrderUserSummaryDto | null;
}

export class PaginatedOrderResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  public items!: OrderResponseDto[];

  @ApiProperty({ example: 10 })
  public total!: number;

  @ApiProperty({ example: 1 })
  public page!: number;

  @ApiProperty({ example: 20 })
  public limit!: number;
}
