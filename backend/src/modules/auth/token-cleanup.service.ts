import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from "@nestjs/common";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { refreshTokens } from "@/database/schemas";
import { lt } from "drizzle-orm";
import { TIME_IN_MS } from "@/common/constants/time.constant";

@Injectable()
export class TokenCleanupService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(TokenCleanupService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  onApplicationBootstrap() {
    this.timer = setInterval(() => {
      void this.cleanupTokens();
    }, TIME_IN_MS.DAY);
    this.logger.log("Token Cleanup Service started.");

    void this.cleanupTokens();
  }

  onApplicationShutdown() {
    clearInterval(this.timer ?? undefined);
    this.logger.log("Token Cleanup Service stopped.");
  }

  async cleanupTokens() {
    try {
      this.logger.debug("Starting cleanup of expired refresh tokens...");

      await this.db
        .delete(refreshTokens)
        .where(lt(refreshTokens.expiresAt, new Date()));

      this.logger.debug("Successfully cleaned up expired refresh tokens.");
    } catch (error) {
      this.logger.error("Error occurred during expired token cleanup", error);
    }
  }
}
