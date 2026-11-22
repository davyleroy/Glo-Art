import 'server-only';
import { randomBytes, createHash } from 'node:crypto';

/**
 * Opaque token generator. The plaintext token is sent to the user; the
 * SHA-256 hash is stored in DB, so a DB compromise alone cannot forge
 * links.
 */
export function generateToken(bytes = 32): { token: string; hash: string } {
  const token = randomBytes(bytes).toString('base64url');
  const hash = hashToken(token);
  return { token, hash };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
