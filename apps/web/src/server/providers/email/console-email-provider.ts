import { logger } from '@/lib/logger';
import type { EmailMessage, EmailProvider } from '../types';

export class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console' as const;

  async send(message: EmailMessage): Promise<{ id: string }> {
    const id = `console-${Date.now()}`;
    logger.info({ provider: 'email.console', id, ...message }, 'Email captured (console)');
    return { id };
  }
}
