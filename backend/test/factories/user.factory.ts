import type { DrizzleDB } from "@/database/database.module";
import { users, type User, type NewUser } from "@/database/schemas";

export async function createUser(
  db: DrizzleDB,
  overrides: Partial<NewUser> = {},
): Promise<User> {
  const uid = crypto.randomUUID().slice(0, 8);

  const [user] = await db
    .insert(users)
    .values({
      email: `user-${uid}@hyundai-nhatnang.vn`,
      fullName: `User Test ${uid}`,
      phoneNumber: "0912345678",
      role: "CUSTOMER",
      status: "ACTIVE",
      passwordHash: "$scrypt$N=128,r=1,p=1$mockPasswordHash",
      ...overrides,
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create User entity in test factory");
  }
  return user;
}
