import { SentryService } from "@/common/services/sentry.service";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";
import type { Logger as DrizzleLogger } from "drizzle-orm/logger";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type {
  ExtractTablesFromSchema,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import * as schema from "./schemas";
import { createDatabasePool, createDrizzleClient } from "./database.connection";

export const DATABASE_CONNECTION = "DATABASE_CONNECTION";
export type DrizzleDB = NodePgDatabase<
  ExtractTablesWithRelations<
    Record<string, never>,
    ExtractTablesFromSchema<typeof schema>
  >
>;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService, { token: SentryService, optional: true }],
      useFactory: (config: ConfigService, sentryService?: SentryService) => {
        const pool = createDatabasePool(
          undefined,
          config.get<string>("DB_URL"),
        );

        const drizzleLogger: DrizzleLogger = {
          logQuery(query: string, params: unknown[]): void {
            sentryService?.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
              message: query.length > 300 ? `${query.slice(0, 300)}...` : query,
              level: "info",
              data: {
                query,
                paramCount: params.length,
              },
            });
          },
        };

        return createDrizzleClient(pool, drizzleLogger);
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
