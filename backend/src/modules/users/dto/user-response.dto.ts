import { ApiProperty } from "@nestjs/swagger";
import {
  USER_ROLES,
  USER_STATUSES,
  BUSINESS_TYPES,
  type UserRole,
  type UserStatus,
  type BusinessType,
} from "@/database/schemas";

export class DealerTierInfoDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "Đại lý Vàng" })
  nameVi!: string;

  @ApiProperty({ example: "Gold Dealer", nullable: true })
  nameEn!: string | null;

  @ApiProperty({ example: "15.00" })
  discountPercentage!: string;
}

export class DealerCompanyDto {
  @ApiProperty({ example: "Công ty Cổ phần Cơ điện Miền Nam", nullable: true })
  companyName!: string | null;

  @ApiProperty({ example: "0314567890", nullable: true })
  taxId!: string | null;

  @ApiProperty({ example: "DEALER", enum: BUSINESS_TYPES, nullable: true })
  businessType!: BusinessType | null;

  @ApiProperty({ example: "Thành phố Hồ Chí Minh", nullable: true })
  province!: string | null;

  @ApiProperty({ example: "500000000.00" })
  creditLimit!: string;

  @ApiProperty({ example: "50000000.00" })
  currentDebt!: string;

  @ApiProperty({ example: "450000000.00" })
  availableCredit!: string;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    nullable: true,
  })
  parentId!: string | null;

  @ApiProperty({ type: DealerTierInfoDto, nullable: true })
  tier!: DealerTierInfoDto | null;
}

export class UserResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ example: "John Doe" })
  fullName!: string;

  @ApiProperty({ example: "0912345678" })
  phoneNumber!: string;

  @ApiProperty({ example: "https://cloudinary.com/avatar.jpg", nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({
    example: "SALES",
    enum: USER_ROLES,
  })
  role!: UserRole;

  @ApiProperty({
    example: "ACTIVE",
    enum: USER_STATUSES,
  })
  status!: UserStatus;

  @ApiProperty({
    example: true,
    description: "True if user email is verified",
  })
  isVerified!: boolean;

  @ApiProperty({ type: DealerCompanyDto, nullable: true })
  dealerCompany!: DealerCompanyDto | null;
}
