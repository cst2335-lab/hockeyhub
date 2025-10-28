// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {locales} from '../../i18n';

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
  params: Promise<Params>; // ← 关键：这里是 Promise
}) {
  const { locale } = await params; // ← 关键：需要 await

  // 严格校验 locale
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // 加载多语言消息
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
