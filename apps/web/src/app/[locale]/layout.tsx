import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { VerificationBanner } from '@/components/auth/verification-banner';
import { auth } from '@/server/auth';
import { db } from '@/lib/db';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          displayName: true,
          email: true,
          emailVerifiedAt: true,
          roles: { select: { role: true } },
        },
      })
    : null;

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader
          user={
            user
              ? {
                  id: user.id,
                  displayName: user.displayName,
                  email: user.email,
                  roles: user.roles.map((r) => r.role),
                }
              : null
          }
        />
        {user && !user.emailVerifiedAt && <VerificationBanner email={user.email} />}
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </NextIntlClientProvider>
  );
}
