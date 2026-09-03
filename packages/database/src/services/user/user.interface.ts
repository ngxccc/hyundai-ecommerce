import type { User } from "../../schemas";
import type { UserProfileDTO, UserB2BProfileDTO } from "../../dtos";

export interface UserService {
  getById(id: string): Promise<UserProfileDTO | undefined>;
  findByPhone(phone: string): Promise<{ id: string } | undefined>;
  findByEmail(email: string): Promise<{ id: string } | undefined>;
  checkDuplicateUser(
    email: string,
    phone: string,
  ): Promise<{ email: string; phone: string | null } | undefined>;
  update(id: string, data: Partial<User>): Promise<{ id: string } | undefined>;
  list(filters?: {
    role?: User["role"];
    businessType?: User["businessType"];
  }): Promise<User[]>;
  getNewUsersCount(days: number): Promise<number>;
  getB2BProfile(id: string): Promise<UserB2BProfileDTO | undefined>;
  listEmployees(ownerId: string): Promise<UserProfileDTO[]>;
}
