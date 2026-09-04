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
import { users, dealerTiers } from "@/database/schemas";
import {
  UserResponseDto,
  type DealerTierInfoDto,
} from "./dto/user-response.dto";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Retrieves the authenticated user profile with dealer company context and credit limits.
   *
   * @param userId - Unique user identifier
   * @returns Comprehensive user profile with tier and credit details
   * @throws NotFoundException if user does not exist
   * @throws ForbiddenException if account is suspended or inactive
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        avatarUrl: users.avatarUrl,
        role: users.role,
        status: users.status,
        emailVerified: users.emailVerified,
        companyName: users.companyName,
        taxId: users.taxId,
        businessType: users.businessType,
        province: users.province,
        creditLimit: users.creditLimit,
        currentDebt: users.currentDebt,
        parentId: users.parentId,
        dealerTierId: users.dealerTierId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(this.i18n.t("users.USER_NOT_FOUND"));
    }

    if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
      throw new ForbiddenException(
        this.i18n.t("users.ACCOUNT_SUSPENDED_OR_INACTIVE"),
      );
    }

    let tierInfo: DealerTierInfoDto | null = null;

    if (user.dealerTierId) {
      const [tier] = await this.db
        .select({
          id: dealerTiers.id,
          nameVi: dealerTiers.nameVi,
          nameEn: dealerTiers.nameEn,
          discountPercentage: dealerTiers.discountPercentage,
        })
        .from(dealerTiers)
        .where(eq(dealerTiers.id, user.dealerTierId))
        .limit(1);

      if (tier) {
        tierInfo = {
          id: tier.id,
          nameVi: tier.nameVi,
          nameEn: tier.nameEn,
          discountPercentage: tier.discountPercentage,
        };
      }
    }

    const isB2bOrHasCompany = Boolean(user.companyName);
    const creditLimitNum = Number(user.creditLimit || 0);
    const currentDebtNum = Number(user.currentDebt || 0);
    const availableCreditNum = Math.max(0, creditLimitNum - currentDebtNum);

    const dealerCompany = isB2bOrHasCompany
      ? {
          companyName: user.companyName,
          taxId: user.taxId,
          businessType: user.businessType,
          province: user.province,
          creditLimit: user.creditLimit || "0.00",
          currentDebt: user.currentDebt || "0.00",
          availableCredit: availableCreditNum.toFixed(2),
          parentId: user.parentId,
          tier: tierInfo,
        }
      : null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      isVerified: user.emailVerified || user.status !== "PENDING_VERIFICATION",
      dealerCompany,
    };
  }
}
