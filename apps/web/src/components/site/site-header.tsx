import { Role } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { env } from '@/lib/env';
import { LocaleSwitcher } from './locale-switcher';
import { UserMenu } from './user-menu';

interface Props {
  user: {
    id: string;
    displayName: string;
    email: string;
    roles: Role[];
  } | null;
}

export async function SiteHeader({ user }: Props) {
  const t = await getTranslations('nav');

  const hasRole = (r: Role) => !!user && user.roles.includes(r);
  const showArtist = hasRole(Role.ARTIST) || hasRole(Role.ADMIN);
  const showCurator = hasRole(Role.CURATOR) || hasRole(Role.ADMIN);
  const showMod = hasRole(Role.MODERATOR) || hasRole(Role.ADMIN);
  const showAdmin = hasRole(Role.ADMIN);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            {env.BRAND_NAME}
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            <Link href="/discover" className="text-sm hover:text-primary">
              {t('discover')}
            </Link>
            <Link href="/galleries" className="text-sm hover:text-primary">
              {t('galleries')}
            </Link>
            {showArtist && (
              <Link href="/studio/artist" className="text-sm hover:text-primary">
                {t('artistStudio')}
              </Link>
            )}
            {showCurator && (
              <Link href="/studio/curator" className="text-sm hover:text-primary">
                {t('curatorStudio')}
              </Link>
            )}
            {showMod && (
              <Link href="/moderation" className="text-sm hover:text-primary">
                {t('moderation')}
              </Link>
            )}
            {showAdmin && (
              <Link href="/admin" className="text-sm hover:text-primary">
                {t('admin')}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {user ? (
            <UserMenu displayName={user.displayName} email={user.email} />
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                {t('login')}
              </Link>
              <Link href="/register" className="btn-primary">
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
