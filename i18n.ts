// i18n.ts
import {getRequestConfig} from 'next-intl/server';

// ===== 新增/补充：命名导出，供客户端组件复用 =====
export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';
export const isSupportedLocale = (l: string): l is Locale =>
  (locales as readonly string[]).includes(l);

// ===== 保留：default 导出给 next-intl 用 =====
export default getRequestConfig(async ({locale}) => {
  const validLocale = isSupportedLocale(locale as string) ? (locale as Locale) : defaultLocale;
  let messages: Record<string, unknown>;
  try {
    const mod = await import(`./messages/${validLocale}.json`);
    messages = mod?.default;
    if (!messages || typeof messages !== 'object') throw new Error('Invalid messages');
  } catch {
    try {
      messages = (await import('./messages/en.json')).default;
    } catch {
      messages = { nav: { home: 'Home', login: 'Sign In', register: 'Get Started' } };
    }
  }
  return {
    locale: validLocale,
    messages
  };
});
