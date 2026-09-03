import type { DrizzleDB } from "@/database/database.module";
import { createUser } from "../factories/user.factory";
import type { User } from "@/database/schemas";

export const UserMother = {
  /** Standard active customer user (role: user, status: active) */
  customer(
    db: DrizzleDB,
    email = `customer-${crypto.randomUUID().slice(0, 6)}@ticketbooking.com`,
  ): Promise<User> {
    return createUser(db, {
      email,
      fullName: "Regular Customer",
      role: "user",
      status: "active",
    });
  },

  /** System administrator user (role: admin, status: active) */
  admin(
    db: DrizzleDB,
    email = `admin-${crypto.randomUUID().slice(0, 6)}@ticketbooking.com`,
  ): Promise<User> {
    return createUser(db, {
      email,
      fullName: "System Admin",
      role: "admin",
      status: "active",
    });
  },

  /** Unverified user pending email verification (status: pending_verification) */
  unverified(db: DrizzleDB): Promise<User> {
    return createUser(db, {
      role: "user",
      status: "pending_verification",
      verificationToken: crypto.randomUUID(),
      verificationExpiresAt: new Date(Date.now() + 86400000),
    });
  },
} as const;
