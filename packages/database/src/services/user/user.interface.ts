import type { TUser } from "../../schemas";
import type { UserProfileDTO, UserB2BProfileDTO } from "../../dtos";

export interface UserService {
  getById(id: string): Promise<UserProfileDTO | undefined>;
  findByPhone(phone: string): Promise<{ id: string } | undefined>;
  findByEmail(email: string): Promise<{ id: string } | undefined>;
  checkDuplicateUser(
    email: string,
    phone: string,
  ): Promise<{ email: string; phone: string | null } | undefined>;
  update(id: string, data: Partial<TUser>): Promise<{ id: string } | undefined>;
  list(filters?: {
    role?: TUser["role"];
    businessType?: TUser["businessType"];
  }): Promise<TUser[]>;
  getNewUsersCount(days: number): Promise<number>;
  getB2BProfile(id: string): Promise<UserB2BProfileDTO | undefined>;
  listEmployees(ownerId: string): Promise<UserProfileDTO[]>;
}
