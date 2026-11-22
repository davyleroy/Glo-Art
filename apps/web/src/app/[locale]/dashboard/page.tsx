import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { currentSubject } from '@/server/authz/session';
import { db } from '@/lib/db';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const subject = await currentSubject();
  if (!subject.isAuthenticated || !subject.userId) {
    redirect({ href: '/login', locale });
  }
  const user = await db.user.findUniqueOrThrow({
    where: { id: subject.userId! },
    select: { displayName: true, email: true, emailVerifiedAt: true, roles: { select: { role: true } } },
  });
  const t = await getTranslations('nav');
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold">{t('dashboard')}</h1>
      <div className="mt-6 grid gap-4">
        <div className="card">
          <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.displayName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email verified</dt>
              <dd className="font-medium">
                {user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Roles</dt>
              <dd className="font-medium">{user.roles.map((r) => r.role).join(', ')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
