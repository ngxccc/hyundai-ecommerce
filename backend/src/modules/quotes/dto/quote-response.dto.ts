import { ApiProperty } from "@nestjs/swagger";
import type { QuoteStatus } from "@/database/schemas/enums.schema";
export class QuoteCommercialTermsDto {
  @ApiProperty({ example: 15, default: 15 })
  public validityDays!: number;

  @ApiProperty({
    example: "Tạm ứng 30%, 70% sau khi bàn giao",
    nullable: true,
    required: false,
  })
  public paymentSchedule?: string | null;

  @ApiProperty({
    example: "12 tháng hoặc 1000 giờ chạy",
    nullable: true,
    required: false,
  })
  public warrantyTerms?: string | null;

  @ApiProperty({
    example: "3-5 ngày làm việc",
    nullable: true,
    required: false,
  })
  public deliveryTime?: string | null;

  @ApiProperty({
    example: "Tại chân công trình bên mua",
    nullable: true,
    required: false,
  })
  public deliveryLocation?: string | null;
}

export class QuoteItemProductSummaryDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Máy phát điện Hyundai 50kVA" })
  public nameVi!: string;

  @ApiProperty({ example: "Hyundai 50kVA Generator", nullable: true })
  public nameEn!: string | null;

  @ApiProperty({ example: "may-phat-dien-hyundai-50kva" })
  public slug!: string;

  @ApiProperty({ example: "180000000.00" })
  public price!: string;

  @ApiProperty({ example: ["https://res.cloudinary.com/hyundai/image1.jpg"] })
  public images!: string[];

  @ApiProperty({ example: 5 })
  public totalStockCache!: number;
}

export class QuoteItemResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9a" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9b" })
  public quoteId!: string;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    nullable: true,
  })
  public productId!: string | null;

  @ApiProperty({ example: false })
  public isCustomItem!: boolean;

  @ApiProperty({ example: "Máy phát điện Hyundai 50kVA", nullable: true })
  public itemName!: string | null;

  @ApiProperty({ example: "DHY50KSE", nullable: true })
  public itemModel!: string | null;

  @ApiProperty({ example: "50kVA 3 Pha Diesel", nullable: true })
  public itemSpecs!: string | null;

  @ApiProperty({ example: 1 })
  public quantity!: number;

  @ApiProperty({ example: "180000000.00", nullable: true })
  public unitPrice!: string | null;

  @ApiProperty({ example: "10.00", nullable: true })
  public discountPercent!: string | null;

  @ApiProperty({ example: "162000000.00", nullable: true })
  public finalUnitPrice!: string | null;

  @ApiProperty({ example: "162000000.00", nullable: true })
  public totalPrice!: string | null;

  @ApiProperty({ example: "175000000.00", nullable: true })
  public requestedPrice!: string | null;

  @ApiProperty({ example: "162000000.00", nullable: true })
  public agreedPrice!: string | null;

  @ApiProperty({ type: () => QuoteItemProductSummaryDto, nullable: true })
  public product?: QuoteItemProductSummaryDto | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}

export class QuoteMessageSenderDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9c" })
  public id!: string;

  @ApiProperty({ example: "Nguyễn Văn Admin" })
  public fullName!: string;

  @ApiProperty({ example: "admin@hyundai-nhatnang.vn" })
  public email!: string;

  @ApiProperty({ example: "ADMIN" })
  public role!: string;
}

export class QuoteMessageResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9d" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9b" })
  public quoteId!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9c" })
  public senderId!: string;

  @ApiProperty({
    example: "Chào chị, chúng tôi có thể hỗ trợ mức giá 14.500.000 VNĐ.",
  })
  public message!: string;

  @ApiProperty({ type: () => QuoteMessageSenderDto, nullable: true })
  public sender?: QuoteMessageSenderDto | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}

export class QuoteUserSummaryDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9e" })
  public id!: string;

  @ApiProperty({ example: "Trần Văn Đại Lý" })
  public fullName!: string;

  @ApiProperty({ example: "dealer@gmail.com" })
  public email!: string;

  @ApiProperty({ example: "0911223344" })
  public phoneNumber!: string;

  @ApiProperty({ example: "SALES" })
  public role!: string;
}

export class QuoteResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9b" })
  public id!: string;

  @ApiProperty({ example: "QT-20260904-5892", nullable: true })
  public quoteNumber!: string | null;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb9e",
    nullable: true,
  })
  public userId!: string | null;

  @ApiProperty({ example: "Trần Văn Doanh", nullable: true })
  public customerName!: string | null;

  @ApiProperty({ example: "0987654321", nullable: true })
  public customerPhone!: string | null;

  @ApiProperty({ example: "doanh.tv@gmail.com", nullable: true })
  public customerEmail!: string | null;

  @ApiProperty({ example: "Tập đoàn Xây Dựng Số 1", nullable: true })
  public companyName!: string | null;

  @ApiProperty({ example: "0312345678", nullable: true })
  public taxId!: string | null;

  @ApiProperty({ example: "Chân công trình Nhà ga T3", nullable: true })
  public shippingAddress!: string | null;

  @ApiProperty({
    example: "SUBMITTED",
    enum: [
      "DRAFT",
      "SUBMITTED",
      "NEGOTIATING",
      "APPROVED",
      "REJECTED",
      "EXPIRED",
    ],
  })
  public status!: QuoteStatus;

  @ApiProperty({ example: "180000000.00", nullable: true })
  public subtotalPrice!: string | null;

  @ApiProperty({ example: 10, nullable: true })
  public vatRate!: number | null;

  @ApiProperty({ example: "18000000.00", nullable: true })
  public vatAmount!: string | null;

  @ApiProperty({ example: "198000000.00", nullable: true })
  public totalQuotedPrice!: string | null;

  @ApiProperty({ type: () => QuoteCommercialTermsDto, nullable: true })
  public commercialTerms!: QuoteCommercialTermsDto | null;

  @ApiProperty({ example: "2026-09-24T08:00:00.000Z", nullable: true })
  public expirationDate!: Date | null;

  @ApiProperty({ example: "Ghi chú báo giá", nullable: true })
  public note!: string | null;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb9f",
    nullable: true,
  })
  public orderId!: string | null;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb9c",
    nullable: true,
  })
  public createdByAdminId!: string | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;

  @ApiProperty({ type: [QuoteItemResponseDto] })
  public items!: QuoteItemResponseDto[];

  @ApiProperty({ type: [QuoteMessageResponseDto], required: false })
  public messages?: QuoteMessageResponseDto[];

  @ApiProperty({ type: () => QuoteUserSummaryDto, nullable: true })
  public user?: QuoteUserSummaryDto | null;
}

export class PaginatedQuoteResponseDto {
  @ApiProperty({ type: [QuoteResponseDto] })
  public items!: QuoteResponseDto[];

  @ApiProperty({ example: 10 })
  public total!: number;

  @ApiProperty({ example: 1 })
  public page!: number;

  @ApiProperty({ example: 20 })
  public limit!: number;
}

export class ApproveToOrderResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9f" })
  public orderId!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb9b" })
  public quoteId!: string;

  @ApiProperty({
    example: "APPROVED",
    enum: [
      "DRAFT",
      "SUBMITTED",
      "NEGOTIATING",
      "APPROVED",
      "REJECTED",
      "EXPIRED",
    ],
  })
  public status!: QuoteStatus;
}
