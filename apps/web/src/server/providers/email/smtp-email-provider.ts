import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { EmailMessage, EmailProvider } from '../types';

export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp' as const;
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
          : undefined,
    });
  }

  async send(message: EmailMessage): Promise<{ id: string }> {
    const info = await this.transporter.sendMail({
      from: message.from ?? env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });
    logger.info(
      { provider: 'email.smtp', id: info.messageId, to: message.to, subject: message.subject },
      'Email sent (smtp)',
    );
    return { id: info.messageId };
  }
}
