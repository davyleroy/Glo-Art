/**
 * Minimal Phase 0 seed: one admin user, one verified buyer.
 * Later phases add artists, listings, galleries, etc.
 */
import { PrismaClient, Role } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const db = new PrismaClient();

const ARGON2_OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

async function main() {
  const adminEmail = 'admin@kaleido.local';
  const buyerEmail = 'buyer@kaleido.local';
  const demoPassword = 'Password123!';
  const passwordHash = await hash(demoPassword, ARGON2_OPTS);
  const now = new Date();

  await db.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      username: 'admin',
      displayName: 'Admin',
      passwordHash,
      emailVerifiedAt: now,
      roles: {
        create: [
          { role: Role.ADMIN },
          { role: Role.MODERATOR },
          { role: Role.BUYER },
        ],
      },
    },
    update: {},
  });

  await db.user.upsert({
    where: { email: buyerEmail },
    create: {
      email: buyerEmail,
      username: 'buyer',
      displayName: 'Demo Buyer',
      passwordHash,
      emailVerifiedAt: now,
      locale: 'en',
      roles: { create: [{ role: Role.BUYER }] },
    },
    update: {},
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded: admin@kaleido.local and buyer@kaleido.local (password: ${demoPassword})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
