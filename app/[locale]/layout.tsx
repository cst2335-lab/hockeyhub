// app/[locale]/layout.tsx
import '../globals.css';

import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {locales, defaultLocale} from '../../i18n';
import Navigation from '../../components/layout/navigation';
// Optional but recommended with next-intl in App Router
import {unstable_setRequestLocale as setRequestLocale} from 'next-intl/server';

type Params = { locale: string };

// Pre-generate all locale segments at build time (optional but helpful for SSG)
export function generateStaticParams() {
  return (locales as readonly string[]).map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  // In Next.js 15, `params` is async and must be awaited
  params
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const {locale} = await params;

  // Validate locale and 404 when unknown
  const normalized =
    (locales as readonly string[]).includes(locale) ? locale : defaultLocale;
  if (!normalized) notFound();

  // Let next-intl know which locale is active for this request
  setRequestLocale(normalized);

  // Load messages explicitly to avoid dynamic inference issues
  const messages = (await import(`../../messages/${normalized}.json`)).default;

  // Do not render <html>/<body> here; only the root layout should
  // Provider must wrap components that use translations (e.g., Navigation)
  return (
    <NextIntlClientProvider locale={normalized} messages={messages}>
      <Navigation />
      {children}
    </NextIntlClientProvider>
  );
}
