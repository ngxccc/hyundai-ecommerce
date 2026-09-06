import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { env } from "@/env";
import type {
  MailTransport,
  SendEmailOptions,
  SendEmailResult,
} from "../interfaces/mail-transport.interface";

@Injectable()
export class ResendMailTransport implements MailTransport {
  private readonly logger = new Logger(ResendMailTransport.name);
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from ?? env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        this.logger.error(`Resend API Error: ${error.message}`);
        throw new Error(error.message);
      }

      return { id: data.id };
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}`, err);
      throw err;
    }
  }
}
