import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { LoginSchema } from '@/schemas/auth';
import { authenticateWithPassword } from '@/server/services/auth.service';
import type { Role } from '@prisma/client';

const providers: NextAuthConfig['providers'] = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(raw) {
      const parsed = LoginSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await authenticateWithPassword(parsed.data);
      if (!user) return null;
      return {
        id: user.id,
        name: user.displayName,
        email: user.email,
        image: null,
      };
    },
  }),
];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const authConfig = {
  adapter: PrismaAdapter(db),
  secret: env.AUTH_SECRET,
  trustHost: env.AUTH_TRUST_HOST,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-email/sent',
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (token.sub) {
        const roles = await db.userRole.findMany({
          where: { userId: token.sub },
          select: { role: true },
        });
        token.roles = roles.map((r) => r.role);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as unknown as { roles: Role[] }).roles =
          (token.roles as Role[]) ?? [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
