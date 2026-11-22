import { getTranslations } from 'next-intl/server';
import { User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { signOut } from '@/server/auth';

export async function UserMenu({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const t = await getTranslations('nav');

  async function signOutAction() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <details className="relative">
      <summary
        className="btn-ghost flex cursor-pointer list-none items-center gap-2"
        aria-label={displayName}
      >
        <User aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">{displayName}</span>
      </summary>
      <div
        role="menu"
        className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-background p-1 shadow-md"
      >
        <div className="px-3 py-2 text-xs text-muted-foreground">{email}</div>
        <Link
          href="/dashboard"
          role="menuitem"
          className="block rounded px-3 py-2 text-sm hover:bg-muted"
        >
          {t('dashboard')}
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            role="menuitem"
            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
          >
            {t('logout')}
          </button>
        </form>
      </div>
    </details>
  );
}
