import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  Optional,
} from "@nestjs/common";
import {
  I18nInternalServerErrorException,
  I18nNotFoundException,
} from "@/common/exceptions";
import { ConfigService } from "@nestjs/config";
import type Redis from "ioredis";
import { eq } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { type CompanySetting, companySettings } from "@/database/schemas";
import { SentryService } from "@/common/services/sentry.service";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import { createRedisClient, parseRedisOptions } from "@/config/redis.config";
import type { CompanySettingsResponseDtoType } from "./dto/company-settings-response.dto";
import type { UpdateCompanySettingsDtoType } from "./dto/update-company-settings.dto";

const CACHE_KEY_COMPANY_SETTINGS = "cache:settings:company";
const CACHE_TTL_SECONDS = TIME_IN_MS.DAY / TIME_IN_MS.SECOND; // 24 hours (86,400s)

@Injectable()
export class CompanySettingsService implements OnModuleDestroy {
  private readonly redisClient?: Redis;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    @Optional() private readonly configService?: ConfigService,
    @Optional() private readonly sentryService?: SentryService,
  ) {
    try {
      const redisUrl = this.configService?.get<string>("REDIS_URL");
      this.redisClient = createRedisClient(
        redisUrl ? parseRedisOptions(redisUrl) : undefined,
      );
      // Register error listener immediately to prevent unhandled EventEmitter errors on reconnection / test run.
      this.redisClient.on("error", (error: Error) => {
        this.sentryService?.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message: `Redis company settings cache connection error: ${error.message}`,
          level: "warning",
        });
      });
    } catch {
      // Fail-open without blocking application startup when Redis is unavailable or unconfigured.
      this.redisClient = undefined;
    }
  }

  /**
   * Retrieves system-wide company metadata, prioritizing Redis cache before falling back to PostgreSQL or seed constants.
   *
   * @returns Current active company configuration
   */
  async getSettings(): Promise<CompanySettingsResponseDtoType> {
    if (this.redisClient) {
      try {
        const cached = await this.redisClient.get(CACHE_KEY_COMPANY_SETTINGS);
        if (cached) {
          const parsed = JSON.parse(cached) as CompanySettingsResponseDtoType;
          return parsed;
        }
      } catch (error) {
        this.sentryService?.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message: `Redis company settings get error: ${error instanceof Error ? error.message : "Unknown error"}`,
          level: "warning",
        });
      }
    }

    const [dbRecord] = await this.db.select().from(companySettings).limit(1);

    if (dbRecord) {
      const result: CompanySettingsResponseDtoType = {
        id: dbRecord.id,
        legalNameVi: dbRecord.legalNameVi,
        legalNameEn: dbRecord.legalNameEn,
        shortName: dbRecord.shortName,
        brandName: dbRecord.brandName,
        brandTitle: dbRecord.brandTitle,
        brandFullName: dbRecord.brandFullName,
        taxId: dbRecord.taxId,
        hotlines: dbRecord.hotlines,
        emails: dbRecord.emails,
        addresses: dbRecord.addresses,
        workingHours: dbRecord.workingHours,
        links: dbRecord.links,
        bank: dbRecord.bank,
        updatedAt: dbRecord.updatedAt,
      };

      await this.setCache(result);
      return result;
    }

    throw new I18nNotFoundException("common.SETTINGS_NOT_FOUND");
  }

  /**
   * Updates or initializes company settings in database and refreshes Redis cache.
   *
   * @param dto New company metadata payload
   * @returns Updated company configuration
   */
  async updateSettings(
    dto: UpdateCompanySettingsDtoType,
  ): Promise<CompanySettingsResponseDtoType> {
    const [existing] = await this.db
      .select({ id: companySettings.id })
      .from(companySettings)
      .limit(1);

    let updatedRecord: CompanySetting;

    if (existing) {
      const [updated] = await this.db
        .update(companySettings)
        .set({
          ...dto,
        })
        .where(eq(companySettings.id, existing.id))
        .returning();
      if (!updated) {
        throw new I18nInternalServerErrorException(
          "common.INTERNAL_SERVER_ERROR",
        );
      }
      updatedRecord = updated;
    } else {
      const [created] = await this.db
        .insert(companySettings)
        .values({
          ...dto,
        })
        .returning();
      if (!created) {
        throw new I18nInternalServerErrorException(
          "common.INTERNAL_SERVER_ERROR",
        );
      }
      updatedRecord = created;
    }

    const result: CompanySettingsResponseDtoType = {
      id: updatedRecord.id,
      legalNameVi: updatedRecord.legalNameVi,
      legalNameEn: updatedRecord.legalNameEn,
      shortName: updatedRecord.shortName,
      brandName: updatedRecord.brandName,
      brandTitle: updatedRecord.brandTitle,
      brandFullName: updatedRecord.brandFullName,
      taxId: updatedRecord.taxId,
      hotlines: updatedRecord.hotlines,
      emails: updatedRecord.emails,
      addresses: updatedRecord.addresses,
      workingHours: updatedRecord.workingHours,
      links: updatedRecord.links,
      bank: updatedRecord.bank,
      updatedAt: updatedRecord.updatedAt,
    };

    await this.setCache(result);
    return result;
  }

  /**
   * Clears the cached company settings entry from Redis.
   */
  async invalidateCache(): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.del(CACHE_KEY_COMPANY_SETTINGS);
      } catch (error) {
        this.sentryService?.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message: `Redis company settings del error: ${error instanceof Error ? error.message : "Unknown error"}`,
          level: "warning",
        });
      }
    }
  }

  private async setCache(data: CompanySettingsResponseDtoType): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.set(
          CACHE_KEY_COMPANY_SETTINGS,
          JSON.stringify(data),
          "EX",
          CACHE_TTL_SECONDS,
        );
      } catch (error) {
        this.sentryService?.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message: `Redis company settings set error: ${error instanceof Error ? error.message : "Unknown error"}`,
          level: "warning",
        });
      }
    }
  }
  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch {
        this.redisClient.disconnect();
      }
    }
  }
}
