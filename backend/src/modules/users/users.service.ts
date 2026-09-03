import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { users } from "@/database/schemas";
import { UserResponseDto } from "./dto/user-response.dto";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(this.i18n.t("users.USER_NOT_FOUND"));
    }

    if (user.status === "suspended" || user.status === "inactive") {
      throw new ForbiddenException(
        this.i18n.t("users.ACCOUNT_SUSPENDED_OR_INACTIVE"),
      );
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.status !== "pending_verification",
      status: user.status,
    };
  }
}
