import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { env } from '@/lib/env';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container flex flex-col items-start gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('copyright', { year, brand: env.BRAND_NAME })}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary">
            {t('about')}
          </Link>
          <Link href="/legal/terms" className="hover:text-primary">
            {t('terms')}
          </Link>
          <Link href="/legal/privacy" className="hover:text-primary">
            {t('privacy')}
          </Link>
          <Link href="/contact" className="hover:text-primary">
            {t('contact')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
