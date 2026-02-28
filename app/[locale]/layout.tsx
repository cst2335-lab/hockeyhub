// app/[locale]/layout.tsx
import '../globals.css';
import { Inter, Lexend } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { locales } from '../../i18n';
import { QueryProvider } from '@/app/providers/query-provider';
import { ThemeProvider } from '@/app/providers/theme-provider';
import { ConditionalNavbar, ConditionalFooter } from '@/components/layout/conditional-nav';
import { serializeJsonLd } from '@/lib/utils/json-ld';

import type { Viewport } from 'next';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

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
    icons: { icon: '/img/icons/icon.svg', apple: '/img/icons/icon-192.png' },
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

  // 加载多语言消息（失败时回退到 en，避免 JSON 解析报错如 "Unexpected end of JSON input"）
  let messages: Record<string, unknown>;
  try {
    const mod = await import(`../../messages/${locale}.json`);
    messages = mod?.default;
    if (!messages || typeof messages !== 'object') throw new Error('Invalid messages');
  } catch {
    try {
      messages = (await import('../../messages/en.json')).default;
    } catch {
      messages = { nav: { home: 'Home', login: 'Sign In', register: 'Get Started' } };
    }
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://gogohockey.ca').replace(/\/$/, '');
  const siteUrl = `${baseUrl}/${locale}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'GoGoHockey',
        url: siteUrl,
        description: descriptions[locale] ?? descriptions.en,
        inLanguage: locale === 'fr' ? 'fr-CA' : 'en-CA',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/games?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'GoGoHockey',
        url: baseUrl,
        logo: `${baseUrl}/img/logo/icon.svg`,
        description: descriptions.en,
      },
    ],
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${lexend.variable}`}
    >
      <body className="min-h-full font-sans antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <ThemeProvider>
          <QueryProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ConditionalNavbar />
              {children}
              <ConditionalFooter />
              <Toaster position="top-center" richColors closeButton />
            </NextIntlClientProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}