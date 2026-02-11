// app/[locale]/layout.tsx
import '../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {Toaster} from 'sonner';
import {locales} from '../../i18n';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

import type { Viewport } from 'next';

export const metadata = {
  icons: { icon: '/icon.svg', apple: '/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

type Params = { locale: string };

/** 为 SSG 预生成 locale 段 */
export function generateStaticParams(): Params[] {
  return (locales as readonly string[]).map((locale) => ({ locale }));
}

/**
 * 注意：Next 15 中 layout 的 params 是 Promise，需要 await
 */
export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { locale } = await params;

  // 严格校验 locale
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // 加载多语言消息
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
          <Footer />
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}