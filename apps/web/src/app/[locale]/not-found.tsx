import { Link } from '@/i18n/routing';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="text-sm uppercase tracking-widest text-terracotta">404</p>
      <h1 className="mt-4 text-3xl font-semibold">We couldn't find that page.</h1>
      <p className="mt-2 text-muted-foreground">The link may be broken or the page may have moved.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
