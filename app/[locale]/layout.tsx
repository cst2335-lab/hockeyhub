// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {locales} from '../../i18n';

type Params = { locale: string };

/**
 * Pre-generate locale segments for SSG (Next 14 style).
 */
export function generateStaticParams(): Params[] {
  return (locales as readonly string[]).map((locale) => ({ locale }));
}

/**
 * Locale-scoped layout (no html/head/body here).
 * Note: `params` is NOT a Promise in Next 14 app dir.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { locale } = params;

  // Validate locale strictly — invalid locale -> 404
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // Load translation messages for this locale
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
