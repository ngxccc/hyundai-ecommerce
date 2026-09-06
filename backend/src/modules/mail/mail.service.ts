import { env } from "@/env";
import { Inject, Injectable } from "@nestjs/common";
import {
  type MailTransport,
  MAIL_TRANSPORT_TOKEN,
} from "./interfaces/mail-transport.interface";

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_TRANSPORT_TOKEN)
    private readonly transport: MailTransport,
  ) {}

  async sendVerificationEmail(
    email: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transport.send({
      to: email,
      subject: "Xác thực tài khoản của bạn",
      html: `
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Hyundai Nhật Năng. Vui lòng click vào đường link dưới đây để kích hoạt tài khoản:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Đường link có thời hạn là 24h.</p>
      `,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transport.send({
      to: email,
      subject: "Khôi phục mật khẩu của bạn",
      html: `
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Hyundai Nhật Năng. Vui lòng click vào đường dẫn dưới đây để khôi phục mật khẩu:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Đường dẫn có thời hạn là 15 phút.</p>
      `,
    });
  }
}
