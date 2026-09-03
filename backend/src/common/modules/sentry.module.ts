import { Global, Module } from "@nestjs/common";
import { SentryService } from "../services/sentry.service";

/**
 * Global module providing Sentry runtime error reporting and telemetry services.
 */
@Global()
@Module({
  providers: [SentryService],
  exports: [SentryService],
})
export class SentryModule {}
