import type { DrizzleDB } from "@/database/database.module";
import { createUser } from "../factories/user.factory";
import type { User } from "@/database/schemas";

export const UserMother = {
  sales(
    db: DrizzleDB,
    email = `sales-${crypto.randomUUID().slice(0, 6)}@hyundai-nhatnang.vn`,
  ): Promise<User> {
    return createUser(db, {
      email,
      fullName: "Sales Staff",
      role: "SALES",
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

  unverified(db: DrizzleDB): Promise<User> {
    return createUser(db, {
      role: "SALES",
      status: "PENDING_VERIFICATION",
      verificationToken: crypto.randomUUID(),
      verificationExpiresAt: new Date(Date.now() + 86400000),
    });
  },

  suspended(db: DrizzleDB): Promise<User> {
    return createUser(db, {
      role: "SALES",
      status: "SUSPENDED",
    });
  },
} as const;
