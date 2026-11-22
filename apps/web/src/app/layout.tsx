import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { env } from '@/lib/env';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: env.BRAND_NAME,
    template: `%s · ${env.BRAND_NAME}`,
  },
  description: 'A global art marketplace, discovered by walking through it.',
  applicationName: env.BRAND_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf7ee' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1915' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
