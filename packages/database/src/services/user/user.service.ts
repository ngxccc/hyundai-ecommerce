import type { UserService } from "../interfaces";
import { type UserProfileDTO } from "../../dtos";
import { and, eq, ne, gte, sql } from "drizzle-orm";
import { type IDatabase } from "../../client";
import { users, type TUser } from "../../schemas/auth.schema";

export class DbUserService implements UserService {
  constructor(protected readonly db: IDatabase) {}

  /**
   * Get a user's profile fields by ID (for portal display)
   */
  async getById(id: string): Promise<UserProfileDTO | undefined> {
    return await this.db.query.users.findFirst({
      where: { id },
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        companyName: true,
        taxId: true,
        businessType: true,
        province: true,
      },
    });
  }

  /**
   * Find a user by phone number
   */
  async findByPhone(phone: string) {
    return await this.db.query.users.findFirst({
      where: {
        phone,
      },
      columns: { id: true },
    });
  }

  /**
   * Find a user by email address
   */
  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: {
        email,
      },
      columns: { id: true },
    });
  }

  /**
   * Check if an email or phone number is already registered
   */
  async checkDuplicateUser(email: string, phone: string) {
    return await this.db.query.users.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
      columns: { email: true, phone: true },
    });
  }

  /**
   * Update fields of an existing user (e.g. promoting roles or assigning dealer tiers)
   */
  async update(
    id: string,
    data: Partial<TUser>,
  ): Promise<{ id: string } | undefined> {
    const [updated] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
      });
    return updated;
  }

  /**
   * List users filtered by role or business type along with their associated dealer tier details
   */
  async list(filters?: {
    role?: TUser["role"];
    businessType?: TUser["businessType"];
  }): Promise<TUser[]> {
    const whereConditions: Record<string, { eq: string }> = {};
    if (filters?.role) {
      whereConditions["role"] = { eq: filters.role };
    }
    if (filters?.businessType) {
      whereConditions["businessType"] = { eq: filters.businessType };
    }

    return await this.db.query.users.findMany({
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      with: {
        tier: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
  /**
   * Get count of new users registered in the last N days (excluding admins)
   */
  async getNewUsersCount(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          ne(users.role, "SUPER_ADMIN"),
          ne(users.role, "SALES_REPRESENTATIVE"),
          ne(users.role, "ACCOUNTANT"),
          ne(users.role, "WAREHOUSE_MANAGER"),
          gte(users.createdAt, cutoffDate),
        ),
      );
    return Number(result[0]?.count ?? 0);
  }
}
