// app/[locale]/layout.tsx
import '../globals.css';

import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {locales, defaultLocale} from '../../i18n';

// Use a working path; if '@' alias isn't ready, keep this relative import
import Navigation from '../../components/layout/navigation';

export default async function LocaleLayout({
  children,
  // Next 15: params is async and must be awaited
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  const normalized =
    (locales as readonly string[]).includes(locale) ? locale : defaultLocale;
  if (!normalized) notFound();

  // Load messages explicitly to avoid runtime inference issues
  const messages = (await import(`../../messages/${normalized}.json`)).default;

  // DO NOT render <html>/<head>/<body> here; only the root layout can do that
  return (
    <>
      <Navigation />
      <NextIntlClientProvider locale={normalized} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
