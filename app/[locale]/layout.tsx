// app/[locale]/layout.tsx
import '../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {Toaster} from 'sonner';
import {locales} from '../../i18n';
import {QueryProvider} from '@/app/providers/query-provider';
import { ConditionalNavbar, ConditionalFooter } from '@/components/layout/conditional-nav';

import type { Viewport } from 'next';
import type { Metadata } from 'next';

const titles: Record<string, string> = {
  en: 'GoGoHockey – Find Games & Book Ice in Ottawa',
  fr: 'GoGoHockey – Trouver des matchs et réserver la glace à Ottawa',
};
const descriptions: Record<string, string> = {
  en: 'Ottawa\'s platform for organizing hockey games and booking ice time. Join players, find games, and book rinks.',
  fr: 'La plateforme ottavienne pour organiser des matchs de hockey et réserver de la glace. Rejoignez les joueurs, trouvez des matchs, réservez des patinoires.',
};

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = (locales as readonly string[]).includes(locale) ? locale : 'en';
  return {
    title: { default: titles[lang] ?? titles.en, template: '%s | GoGoHockey' },
    description: descriptions[lang] ?? descriptions.en,
    icons: { icon: '/icon.svg', apple: '/icon-192.png' },
    openGraph: {
      title: titles[lang] ?? titles.en,
      description: descriptions[lang] ?? descriptions.en,
      locale: lang === 'fr' ? 'fr_CA' : 'en_CA',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#18304B',
};

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
        <QueryProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ConditionalNavbar />
            {children}
            <ConditionalFooter />
            <Toaster position="top-center" richColors closeButton />
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}