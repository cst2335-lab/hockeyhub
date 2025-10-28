// app/[locale]/layout.tsx
import '../globals.css';
import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {locales} from '../../i18n';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

type Params = { locale: string };

// 让 Next 预生成本地化段
export function generateStaticParams(): Params[] {
  return (locales as readonly string[]).map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { locale } = params;

  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}
