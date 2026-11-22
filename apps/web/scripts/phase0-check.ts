/**
 * One-shot Phase 0 backend verification. Runs the real register → verify →
 * login flow against the local docker stack, then prints a PASS/FAIL summary.
 *
 * Usage: pnpm --filter @kaleido/web tsx scripts/phase0-check.ts
 */
import { registerUser, verifyEmailToken, authenticateWithPassword } from '../src/server/services/auth.service';
import { db } from '../src/lib/db';

const MAILHOG_API = 'http://localhost:8025/api/v2';

function decodeQP(input: string): string {
  // Drop soft line breaks and decode =XX hex sequences.
  return input
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

async function pollMailForLink(email: string): Promise<string> {
  for (let i = 0; i < 30; i += 1) {
    const res = await fetch(`${MAILHOG_API}/search?kind=to&query=${encodeURIComponent(email)}`);
    const body = (await res.json()) as { items?: Array<{ Content?: { Body?: string } }> };
    const text = decodeQP(body.items?.[0]?.Content?.Body ?? '');
    const match = text.match(/https?:\/\/[^\s"<>]+\/verify-email\?token=[A-Za-z0-9_\-]+/);
    if (match) return match[0];
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No verification email found for ${email}`);
}

async function main() {
  const email = `phase0-${Date.now()}@kaleido.test`;
  const username = `u${Date.now().toString().slice(-8)}`;
  const password = 'TestPassword123!';
  const steps: Array<[string, boolean, string?]> = [];

  const reg = await registerUser({
    email,
    password,
    displayName: 'Phase Zero',
    username,
    locale: 'en',
    acceptTerms: true,
  });
  steps.push(['register', !!reg.userId, `userId=${reg.userId} emailSent=${reg.emailSent}`]);

  const link = await pollMailForLink(email);
  const token = new URL(link).searchParams.get('token')!;
  steps.push(['mailhog received verification link', true, link.slice(0, 80) + '...']);

  const ver = await verifyEmailToken(token);
  steps.push(['verify token', ver.userId === reg.userId, `userId=${ver.userId}`]);

  const auth = await authenticateWithPassword({ email, password });
  steps.push([
    'authenticate with password',
    !!auth && auth.id === reg.userId && !!auth.emailVerifiedAt,
    auth ? `roles=${auth.roles.join(',')} verified=${!!auth.emailVerifiedAt}` : 'null',
  ]);

  const bad = await authenticateWithPassword({ email, password: 'wrong-password-xxx' });
  steps.push(['reject bad password', bad === null, '']);

  for (const [name, ok, extra] of steps) {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `   (${extra})` : ''}`);
  }
  await db.$disconnect();
  if (steps.some(([, ok]) => !ok)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
