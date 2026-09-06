export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendEmailResult {
  id?: string;
}

export interface MailTransport {
  send(options: SendEmailOptions): Promise<SendEmailResult>;
}

export const MAIL_TRANSPORT_TOKEN = Symbol("MAIL_TRANSPORT_TOKEN");
