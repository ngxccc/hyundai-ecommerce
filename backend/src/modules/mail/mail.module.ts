import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MAIL_TRANSPORT_TOKEN } from "./interfaces/mail-transport.interface";
import { ResendMailTransport } from "./transports/resend-mail.transport";
import { LogMailTransport } from "./transports/log-mail.transport";
import { env } from "@/env";

@Module({
  providers: [
    MailService,
    {
      provide: MAIL_TRANSPORT_TOKEN,
      useClass:
        env.MAIL_DRIVER === "resend" ? ResendMailTransport : LogMailTransport,
    },
  ],
  exports: [MailService, MAIL_TRANSPORT_TOKEN],
})
export class MailModule {}
