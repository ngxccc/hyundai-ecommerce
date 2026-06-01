import { eq } from "drizzle-orm";
import { type IDatabase } from "../client";
import { users, type TUser } from "../schemas/auth.schema";

export class UserService {
  constructor(protected readonly db: IDatabase) {}

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
  async update(id: string, data: Partial<TUser>): Promise<TUser | undefined> {
    const [updated] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  /**
   * List users filtered by role or business type along with their associated dealer tier details
   */
  async list(filters?: { role?: TUser["role"]; businessType?: TUser["businessType"] }): Promise<TUser[]> {
    const whereConditions: Record<string, { eq: string }> = {};
    if (filters?.role) {
      whereConditions["role"] = { eq: filters.role };
    }
    if (filters?.businessType) {
      whereConditions["businessType"] = { eq: filters.businessType };
    }

    return await this.db.query.users.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      with: {
        tier: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
