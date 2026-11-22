import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  return <HomeContent params={params} />;
}

async function HomeContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeBody />;
}

function HomeBody() {
  const t = useTranslations('home');
  return (
    <section className="container py-16 md:py-24">
      <p className="text-sm uppercase tracking-widest text-terracotta">{t('heroEyebrow')}</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
        {t('heroTitle')}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t('heroBody')}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/register" className="btn-primary">
          {t('ctaJoin')}
        </Link>
        <Link href="/discover" className="btn-secondary">
          {t('ctaExplore')}
        </Link>
      </div>
    </section>
  );
}
