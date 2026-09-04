import type { JwtService } from "@nestjs/jwt";
import type { DrizzleDB } from "@/database/database.module";
import type { User, NewUser } from "@/database/schemas";
import type { JwtPayload } from "@/common/decorators/current-user.decorator";
import { createUser } from "../factories/user.factory";

export interface AuthenticatedSession {
  user: User;
  token: string;
  authHeader: { Authorization: string };
}

/**
 * Generates a valid signed JWT string from a JwtPayload object.
 */
export async function generateTestToken(
  jwtService: JwtService,
  payload: JwtPayload,
): Promise<string> {
  return jwtService.signAsync(payload);
}

/**
 * Creates a user in the database and generates a corresponding authenticated test session with headers.
 */
export async function createAuthenticatedUser(
  db: DrizzleDB,
  jwtService: JwtService,
  overrides: Partial<NewUser> = {},
): Promise<AuthenticatedSession> {
  const user = await createUser(db, {
    role: "CUSTOMER",
    status: "ACTIVE",
    ...overrides,
  });

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const token = await generateTestToken(jwtService, payload);

  return {
    user,
    token,
    authHeader: { Authorization: `Bearer ${token}` },
  };
}

/**
 * Creates an administrator user in the database and generates an admin session.
 */
export async function createAuthenticatedAdmin(
  db: DrizzleDB,
  jwtService: JwtService,
  overrides: Partial<NewUser> = {},
): Promise<AuthenticatedSession> {
  return createAuthenticatedUser(db, jwtService, {
    role: "ADMIN",
    ...overrides,
  });
}
