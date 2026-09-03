import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { env } from "@/env";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;

  constructor() {
    // WHY: Initialize Resend client inside constructor using type-safe environment key.
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendVerificationEmail(
    email: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    if (env.NODE_ENV !== "production" && email.endsWith("@example.com")) {
      this.logger.debug(
        `Bypassing verification email to ${email} (test domain).`,
      );
      return;
    }

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      const { error } = await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: "Xác thực tài khoản của bạn",
        html: `
          <p>Xin chào <strong>${fullName}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Ticket Booking. Vui lòng click vào đường link dưới đây để kích hoạt tài khoản:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>Đường link có thời hạn là 24h.</p>
        `,
      });

      if (error) {
        this.logger.error(`Resend API Error: ${error.message}`);
        throw new Error(error.message);
      }
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${email}`, err);
      throw err;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    if (env.NODE_ENV !== "production" && email.endsWith("@example.com")) {
      this.logger.debug(
        `Bypassing password reset email to ${email} (test domain).`,
      );
      return;
    }

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      const { error } = await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: "Khôi phục mật khẩu của bạn",
        html: `
          <p>Xin chào <strong>${fullName}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Ticket Booking. Vui lòng click vào đường dẫn dưới đây để khôi phục mật khẩu:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Đường dẫn có thời hạn là 15 phút.</p>
        `,
      });

      if (error) {
        this.logger.error(`Resend API Error: ${error.message}`);
        throw new Error(error.message);
      }
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${email}`, err);
      throw err;
    }
  }
}
