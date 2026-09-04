import type { DrizzleDB } from "@/database/database.module";
import { createUser } from "../factories/user.factory";
import type { User } from "@/database/schemas";

export const UserMother = {
  customer(
    db: DrizzleDB,
    email = `customer-${crypto.randomUUID().slice(0, 6)}@hyundai-nhatnang.vn`,
  ): Promise<User> {
    return createUser(db, {
      email,
      fullName: "Regular Customer",
      role: "CUSTOMER",
      status: "ACTIVE",
    });
  },

  admin(
    db: DrizzleDB,
    email = `admin-${crypto.randomUUID().slice(0, 6)}@hyundai-nhatnang.vn`,
  ): Promise<User> {
    return createUser(db, {
      email,
      fullName: "System Admin",
      role: "ADMIN",
      status: "ACTIVE",
    });
  },

  dealerApprover(
    db: DrizzleDB,
    dealerTierId?: string,
    email = `dealer.approver-${crypto.randomUUID().slice(0, 6)}@hyundai-nhatnang.vn`,
  ): Promise<User> {
    return createUser(db, {
      email,
      fullName: "Dealer Approver",
      role: "DEALER_APPROVER",
      status: "ACTIVE",
      companyName: "Công ty Cổ phần Cơ điện Miền Nam",
      taxId: "0314567890",
      businessType: "DEALER",
      province: "Thành phố Hồ Chí Minh",
      creditLimit: "500000000.00",
      currentDebt: "50000000.00",
      dealerTierId,
    });
  },

  dealerPurchaser(
    db: DrizzleDB,
    parentId?: string,
    email = `dealer.purchaser-${crypto.randomUUID().slice(0, 6)}@hyundai-nhatnang.vn`,
  ): Promise<User> {
    return createUser(db, {
      email,
      fullName: "Dealer Purchaser",
      role: "DEALER_PURCHASER",
      status: "ACTIVE",
      companyName: "Công ty Cổ phần Cơ điện Miền Nam",
      taxId: "0314567890",
      parentId,
    });
  },

  unverified(db: DrizzleDB): Promise<User> {
    return createUser(db, {
      role: "CUSTOMER",
      status: "PENDING_VERIFICATION",
      verificationToken: crypto.randomUUID(),
      verificationExpiresAt: new Date(Date.now() + 86400000),
    });
  },

  suspended(db: DrizzleDB): Promise<User> {
    return createUser(db, {
      role: "CUSTOMER",
      status: "SUSPENDED",
    });
  },
} as const;
