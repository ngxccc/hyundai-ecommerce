import { Injectable, Logger } from "@nestjs/common";
import type {
  MailTransport,
  SendEmailOptions,
  SendEmailResult,
} from "../interfaces/mail-transport.interface";

@Injectable()
export class LogMailTransport implements MailTransport {
  private readonly logger = new Logger(LogMailTransport.name);

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    this.logger.debug(
      `[LogMailTransport] Simulating email delivery to: ${options.to} | Subject: "${options.subject}"`,
    );
    return Promise.resolve({ id: `log-${String(Date.now())}` });
  }
}
