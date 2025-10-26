// app/[locale]/layout.tsx
import '../globals.css';

import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {locales, defaultLocale} from '../../i18n';

type Params = { locale: string };

/**
 * Pre-generate locale segments for SSG (Next 14 style).
 */
export function generateStaticParams(): Params[] {
  return (locales as readonly string[]).map((locale) => ({locale}));
}

/**
 * Locale-scoped layout (Next 14 — `params` is NOT a Promise).
 */
export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Params;
}) {
  const {locale} = params;

  // Validate locale and normalize
  const normalized =
    (locales as readonly string[]).includes(locale) ? locale : defaultLocale;
  if (!normalized) notFound();

  // Load translation messages explicitly
  const messages = (await import(`../../messages/${normalized}.json`)).default;

  // Do NOT render <html>/<head>/<body> here; only the root layout may do that.
  return (
    <NextIntlClientProvider locale={normalized} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
