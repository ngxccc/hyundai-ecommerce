import { SentryModule } from "./common/modules/sentry.module";
import { BullModule } from "@nestjs/bullmq";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { env } from "./env";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
} from "nestjs-i18n";
import path from "node:path";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DealerTiersModule } from "./modules/dealer-tiers/dealer-tiers.module";
import { OutboxModule } from "./modules/outbox/outbox.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { WarehouseModule } from "./modules/warehouse/warehouse.module";
import { CartModule } from "./modules/cart/cart.module";
import { QuotesModule } from "./modules/quotes/quotes.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { AppController } from "./app.controller";
import { parseRedisOptions } from "./config/redis.config";
import { ZodValidationPipe } from "./common/pipes/zod-validation.pipe";

const getRedisOptions = () =>
  parseRedisOptions(env.REDIS_URL, env.REDIS_HOST, env.REDIS_PORT);

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        level: env.NODE_ENV === "production" ? "info" : "debug",
        transport:
          env.NODE_ENV !== "production" && env.NODE_ENV !== "test"
            ? {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: getRedisOptions(),
    }),
    I18nModule.forRoot({
      fallbackLanguage: "vi",
      loaderOptions: {
        path: path.join(__dirname, "/i18n/"),
        watch: true,
      },
      resolvers: [new HeaderResolver(["x-lang"]), AcceptLanguageResolver],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          ttl: 60000,
          limit: 100,
        },
        {
          name: "auth",
          ttl: 60000,
          limit: env.NODE_ENV === "production" ? 5 : 100,
        },
      ],
      storage:
        env.NODE_ENV === "test"
          ? undefined
          : new ThrottlerStorageRedisService(getRedisOptions()),
    }),
    DatabaseModule,
    SentryModule,
    AuthModule,
    UsersModule,
    DealerTiersModule,
    OutboxModule,
    LeadsModule,
    CatalogModule,
    WarehouseModule,
    CartModule,
    QuotesModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
