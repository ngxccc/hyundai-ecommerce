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
      email: `user-${uid}@ticketbooking.com`,
      fullName: `User Test ${uid}`,
      phoneNumber: "0912345678",
      role: "user",
      status: "active",
      passwordHash: "$scrypt$N=16384,r=8,p=1$mockPasswordHash",
      ...overrides,
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create User entity in test factory");
  }
  return user;
}
