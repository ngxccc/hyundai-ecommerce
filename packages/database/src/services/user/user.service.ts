import type { UserService } from "../interfaces";
import { type UserProfileDTO, type UserB2BProfileDTO } from "../../dtos";
import { and, or, eq, ne, gte, sql } from "drizzle-orm";
import { type IDatabase } from "../../client";
import { users, type TUser } from "../../schemas/auth.schema";

export class DbUserService implements UserService {
  constructor(protected readonly db: IDatabase) {}

  /**
   * Get a user's profile fields by ID (for portal display)
   */
  async getById(id: string): Promise<UserProfileDTO | undefined> {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        companyName: users.companyName,
        taxId: users.taxId,
        businessType: users.businessType,
        province: users.province,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  /**
   * Get a user's B2B profile fields by ID (including credit/debt details)
   */
  async getB2BProfile(id: string): Promise<UserB2BProfileDTO | undefined> {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        companyName: users.companyName,
        taxId: users.taxId,
        businessType: users.businessType,
        province: users.province,
        creditLimit: users.creditLimit,
        currentDebt: users.currentDebt,
        dealerTierId: users.dealerTierId,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  /**
   * Find a user by phone number
   */
  async findByPhone(phone: string): Promise<{ id: string } | undefined> {
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    return user;
  }

  /**
   * Find a user by email address
   */
  async findByEmail(email: string): Promise<{ id: string } | undefined> {
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  /**
   * Check if an email or phone number is already registered
   */
  async checkDuplicateUser(
    email: string,
    phone: string,
  ): Promise<{ email: string; phone: string | null } | undefined> {
    const [user] = await this.db
      .select({ email: users.email, phone: users.phone })
      .from(users)
      .where(or(eq(users.email, email), eq(users.phone, phone)))
      .limit(1);
    return user;
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
    const whereConditions = filters?.role || filters?.businessType
      ? {
          ...(filters.role ? { role: { eq: filters.role } } : {}),
          ...(filters.businessType ? { businessType: { eq: filters.businessType } } : {}),
        }
      : undefined;

    return await this.db.query.users.findMany({
      where: whereConditions,
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
