import { ApiProperty } from "@nestjs/swagger";
import { LEAD_STATUSES, type LeadStatus } from "@/database/schemas";

export class LeadItemResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb99" })
  public productId!: string;

  @ApiProperty({ example: 1 })
  public quantity!: number;

  @ApiProperty({
    example: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha",
  })
  public productNameVi!: string;

  @ApiProperty({
    example: "Hyundai DHY65KSE 60kVA 3-Phase Diesel Generator",
    nullable: true,
  })
  public productNameEn!: string | null;

  @ApiProperty({ example: "DHY65KSE", nullable: true })
  public productModel!: string | null;

  @ApiProperty({ example: "GEN-DHY65KSE", nullable: true })
  public productSku!: string | null;
}

export class LeadResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "RFQ-20260904-001" })
  public leadCode!: string;

  @ApiProperty({ example: "Nguyễn Văn An" })
  public fullName!: string;

  @ApiProperty({ example: "0912345678" })
  public phoneNumber!: string;

  @ApiProperty({ example: "an.nguyen@example.com", nullable: true })
  public email!: string | null;

  @ApiProperty({
    example: "Công ty TNHH Cơ điện Bình Dương",
    nullable: true,
  })
  public companyName!: string | null;

  @ApiProperty({ example: "Bình Dương" })
  public city!: string;

  @ApiProperty({ example: "Phường Dĩ An" })
  public ward!: string;

  @ApiProperty({
    example: "Khu công nghiệp Sóng Thần 1, Đường số 3",
    nullable: true,
  })
  public streetAddress!: string | null;

  @ApiProperty({
    example: "Cần tư vấn máy phát điện diesel 60kVA kèm tủ ATS cho nhà máy may",
    nullable: true,
  })
  public notes!: string | null;

  @ApiProperty({ example: "NEW", enum: LEAD_STATUSES })
  public status!: LeadStatus;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb11",
    nullable: true,
  })
  public assignedSalesId!: string | null;

  @ApiProperty({ example: null, nullable: true })
  public lostReason!: string | null;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ type: [LeadItemResponseDto] })
  public items?: LeadItemResponseDto[];
}
