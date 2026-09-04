import type { DrizzleDB } from "@/database/database.module";
import { users, type User, type NewUser } from "@/database/schemas";

export async function createUser(
  db: DrizzleDB,
  overrides: Partial<NewUser> = {},
): Promise<User> {
  const uid = crypto.randomUUID().slice(0, 8);
  const randomDigits = String(Math.floor(10000000 + Math.random() * 90000000));

  const [user] = await db
    .insert(users)
    .values({
      email: `user-${uid}@hyundai-nhatnang.vn`,
      fullName: `User Test ${uid}`,
      phoneNumber: `09${randomDigits}`,
      role: "SALES",
      status: "ACTIVE",
      passwordHash: "$scrypt$N=128,r=1,p=1$mockPasswordHash",
      ...overrides,
    })
    .returning({
      id: users.id,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      deletedAt: users.deletedAt,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      avatarUrl: users.avatarUrl,
      passwordHash: users.passwordHash,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      dealerTierId: users.dealerTierId,
      parentId: users.parentId,
      companyName: users.companyName,
      taxId: users.taxId,
      businessType: users.businessType,
      province: users.province,
      creditLimit: users.creditLimit,
      currentDebt: users.currentDebt,
      verificationToken: users.verificationToken,
      verificationExpiresAt: users.verificationExpiresAt,
      resetPasswordToken: users.resetPasswordToken,
      resetPasswordExpiresAt: users.resetPasswordExpiresAt,
    });
  if (!user) {
    throw new Error("Failed to create User entity in test factory");
  }
  return user;
}
