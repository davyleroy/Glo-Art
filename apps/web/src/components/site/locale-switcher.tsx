'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { locales, localeLabels, type Locale } from '@/i18n/config';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const t = useTranslations('locale');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function change(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    startTransition(() => {
      router.replace(pathname, { locale: next });
      router.refresh();
    });
  }

  return (
    <label className="relative inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{t('label')}</span>
      <Globe aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
      <select
        onChange={change}
        aria-label={t('label')}
        disabled={isPending}
        className="appearance-none rounded-md border border-border bg-background py-1 pl-2 pr-6 text-sm hover:bg-muted"
        defaultValue={(() => {
          // The first path segment is the current locale in `localePrefix: 'always'`.
          const seg = pathname.split('/').filter(Boolean)[0];
          return locales.includes(seg as Locale) ? seg : 'en';
        })()}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
