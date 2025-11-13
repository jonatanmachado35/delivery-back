import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        'SMTP environment variables not fully configured. Emails will not be sent.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Attempted to send reset email to ${email}, but SMTP is not configured.`,
      );
      return;
    }

    const from = process.env.MAIL_FROM ?? process.env.SMTP_USER ?? 'no-reply@example.com';
    const resetUrl = this.buildResetUrl(email, token);
    const text = `Olá,\n\nRecebemos uma solicitação para redefinir sua senha.\nUse o token abaixo ou acesse o link, caso disponível.\n\nToken: ${token}\n${
      resetUrl ? `Link: ${resetUrl}\n\n` : ''
    }Se você não solicitou essa alteração, ignore este email.\n\nEquipe Thinkworld`;

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Redefinição de senha - Thinkworld',
        text,
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error as Error);
    }
  }

  private buildResetUrl(email: string, token: string): string | null {
    const baseUrl = process.env.PASSWORD_RESET_URL;
    if (!baseUrl) {
      return null;
    }

    const url = new URL(baseUrl);
    url.searchParams.set('email', email);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
