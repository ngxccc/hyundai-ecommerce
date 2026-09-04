import type { DrizzleDB } from "@/database/database.module";
import { dealerTiers, users } from "@/database/schemas";
import {
  getSeedPasswordHash,
  isScopeActive,
  type SeedScope,
} from "../constants/seed.constant";
import type { Tier1SeedResult } from "../types/seed.type";

export const SILVER_TIER_ID = "019de19f-863e-7b1d-ab3d-4539b4f9b950";
export const GOLD_TIER_ID = "019de19f-ecc7-71c1-a06c-2377ca8d5a33";
export const PLATINUM_TIER_ID = "019de1a0-0705-729b-a369-9ccb56fb8a8d";

export const ADMIN_USER_ID = "019de1a0-0000-7000-8000-000000000001";
export const DEALER1_APPROVER_ID = "019de1a0-1234-71bf-8082-ec510823ed3c";
export const DEALER1_PURCHASER_ID = "019de1a0-1234-71bf-8082-ec510823ed3d";
export const DEALER2_APPROVER_ID = "019de1a0-5678-71bf-8082-f37ae97f09e4";
export const CUSTOMER_USER_ID = "019de1a0-9012-735c-8639-3e1d67c3f6c5";

export async function seedTier1Reference(
  db: DrizzleDB,
  scopes: SeedScope[],
): Promise<Tier1SeedResult> {
  const result: Tier1SeedResult = {
    dealerTiers: [],
    users: [],
  };

  // 1. Seed Dealer Tiers
  if (isScopeActive(scopes, "reference", "dealer-tiers")) {
    const tierData = [
      {
        id: SILVER_TIER_ID,
        nameVi: "Đại lý Bạc",
        nameEn: "Silver Dealer",
        discountPercentage: "5.00",
        minimumSpend: "50000000.00",
      },
      {
        id: GOLD_TIER_ID,
        nameVi: "Đại lý Vàng",
        nameEn: "Gold Dealer",
        discountPercentage: "10.00",
        minimumSpend: "200000000.00",
      },
      {
        id: PLATINUM_TIER_ID,
        nameVi: "Đại lý Bạch Kim",
        nameEn: "Platinum Dealer",
        discountPercentage: "15.00",
        minimumSpend: "1000000000.00",
      },
    ];

    await db.insert(dealerTiers).values(tierData).onConflictDoNothing();

    result.dealerTiers = await db
      .select({
        id: dealerTiers.id,
        nameVi: dealerTiers.nameVi,
        nameEn: dealerTiers.nameEn,
        discountPercentage: dealerTiers.discountPercentage,
      })
      .from(dealerTiers);
  }

  // 2. Seed Users
  if (isScopeActive(scopes, "reference", "users")) {
    const passwordHash = await getSeedPasswordHash();

    const userData = [
      {
        id: ADMIN_USER_ID,
        fullName: "Quản trị viên Hệ thống",
        email: "admin@hyundai-nhatnang.vn",
        phoneNumber: "0900000001",
        passwordHash,
        role: "ADMIN" as const,
        status: "ACTIVE" as const,
        emailVerified: true,
        businessType: "COMMERCIAL" as const,
        companyName: "Hyundai Nhật Năng Co., Ltd",
        province: "Thành phố Hồ Chí Minh",
        creditLimit: "0.00",
        currentDebt: "0.00",
      },
      {
        id: DEALER1_APPROVER_ID,
        fullName: "Nguyễn Văn Hùng (Nhật Năng Partner)",
        email: "hung.nguyen@nhatnangpartner.vn",
        phoneNumber: "0912345678",
        passwordHash,
        role: "DEALER_APPROVER" as const,
        status: "ACTIVE" as const,
        emailVerified: true,
        dealerTierId: GOLD_TIER_ID,
        companyName: "Công ty Cổ phần Cơ điện Miền Nam",
        taxId: "0314567890",
        businessType: "DEALER" as const,
        province: "Thành phố Hồ Chí Minh",
        creditLimit: "500000000.00",
        currentDebt: "50000000.00",
      },
      {
        id: DEALER1_PURCHASER_ID,
        fullName: "Trần Văn Nam (Nhân viên Mua hàng)",
        email: "nhanvien.hung@nhatnangpartner.vn",
        phoneNumber: "0912345679",
        passwordHash,
        role: "DEALER_PURCHASER" as const,
        status: "ACTIVE" as const,
        emailVerified: true,
        dealerTierId: GOLD_TIER_ID,
        parentId: DEALER1_APPROVER_ID,
        companyName: "Công ty Cổ phần Cơ điện Miền Nam",
        taxId: "0314567890",
        businessType: "DEALER" as const,
        province: "Thành phố Hồ Chí Minh",
        creditLimit: "0.00",
        currentDebt: "0.00",
      },
      {
        id: DEALER2_APPROVER_ID,
        fullName: "Trần Thanh Sơn",
        email: "son.tran@vietnamconstruct.com",
        phoneNumber: "0987654321",
        passwordHash,
        role: "DEALER_APPROVER" as const,
        status: "ACTIVE" as const,
        emailVerified: true,
        dealerTierId: SILVER_TIER_ID,
        companyName: "Tổng Công ty Xây dựng Việt Nam",
        taxId: "0107894561",
        businessType: "CONTRACTOR" as const,
        province: "Hà Nội",
        creditLimit: "200000000.00",
        currentDebt: "0.00",
      },
      {
        id: CUSTOMER_USER_ID,
        fullName: "Lê Minh Tâm",
        email: "tam.le@gmail.com",
        phoneNumber: "0909123456",
        passwordHash,
        role: "CUSTOMER" as const,
        status: "ACTIVE" as const,
        emailVerified: false,
        businessType: "END_USER" as const,
        province: "Đà Nẵng",
        creditLimit: "0.00",
        currentDebt: "0.00",
      },
    ];

    await db.insert(users).values(userData).onConflictDoNothing();

    result.users = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullName: users.fullName,
        dealerTierId: users.dealerTierId,
        creditLimit: users.creditLimit,
      })
      .from(users);
  }

  return result;
}
