import { pino } from 'pino';
import { env } from './env';

// Next.js + Turbopack can't bundle pino's worker-thread transports
// (pino-pretty), so we emit JSON to stdout. Pipe through `pino-pretty`
// externally during local dev if you want colorized output.
export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: 'kaleido-web',
    env: env.NODE_ENV,
  },
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'password',
      'token',
      'secret',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.secret',
    ],
    remove: true,
  },
});
