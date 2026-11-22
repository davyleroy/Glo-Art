import { env } from '@/lib/env';
import type { EmailProvider } from '../types';
import { ConsoleEmailProvider } from './console-email-provider';
import { SmtpEmailProvider } from './smtp-email-provider';

export function createEmailProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case 'console':
      return new ConsoleEmailProvider();
    case 'smtp':
      return new SmtpEmailProvider();
    case 'resend':
      // Phase 2+ wiring: swap in the Resend-backed provider when RESEND_API_KEY is set.
      // For now, SMTP through MailHog or a Resend SMTP relay works for dev/demo.
      return new SmtpEmailProvider();
    default:
      return new ConsoleEmailProvider();
  }
}
