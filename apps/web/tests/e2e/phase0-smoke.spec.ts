import { test, expect } from '@playwright/test';

/**
 * Phase 0 exit-gate smoke (spec §17):
 *  register → verify email via MailHog → log in → switch locale →
 *  see role-aware nav (dashboard link appears).
 *
 * Requires `docker compose up -d` so Postgres + MailHog are reachable,
 * and `pnpm db:migrate` so the schema exists.
 */

const MAILHOG_API = 'http://localhost:8025/api/v2';

function unique(label: string): string {
  // username schema only allows [a-z0-9_]
  const id = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return `${label}_${id}`;
}

function decodeQP(input: string): string {
  return input
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

async function findVerificationLink(email: string, page: import('@playwright/test').Page) {
  for (let i = 0; i < 30; i += 1) {
    const res = await page.request.get(`${MAILHOG_API}/search?kind=to&query=${encodeURIComponent(email)}`);
    const body = await res.json();
    const msg = body?.items?.[0];
    if (msg) {
      const content: string = decodeQP(msg.Content?.Body ?? '');
      const match = content.match(/https?:\/\/[^\s"<>]+\/verify-email\?token=[A-Za-z0-9_\-]+/);
      if (match) return match[0];
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`No verification email arrived for ${email}`);
}

test('visitor registers, verifies, logs in, switches locale, sees role-aware nav', async ({
  page,
  baseURL,
}) => {
  const email = `${unique('user')}@kaleido.test`;
  const password = 'TestPassword123!';
  const username = unique('u').slice(0, 30);

  await page.goto(`${baseURL}/en/register`);
  await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();

  await page.getByLabel('Display name').fill('Test User');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel(/Terms/i).check();
  await page.getByRole('button', { name: /Create account/i }).click();

  await expect(page).toHaveURL(/\/verify-email\/sent/);

  const link = await findVerificationLink(email, page);
  await page.goto(link);
  await expect(page.getByRole('heading', { name: /Email verified/i })).toBeVisible();

  // Log in.
  await page.goto(`${baseURL}/en/login`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();

  // Switch to French.
  await page.getByRole('combobox', { name: /Language|Langue|Ururimi/i }).selectOption('fr');
  await expect(page).toHaveURL(/\/fr\/dashboard/);
  await expect(page.getByRole('heading', { name: /Tableau de bord/i })).toBeVisible();

  // Role-aware nav: verified buyer sees no studios; sanity-check the user menu.
  await expect(page.getByRole('link', { name: /Studio/i })).toHaveCount(0);
});
