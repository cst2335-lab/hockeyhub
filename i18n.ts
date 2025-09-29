// i18n.ts
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'fr'] as const;

export default getRequestConfig(async ({locale}) => {
  const validLocale = locale && locales.includes(locale as any) ? locale : 'en';
  
  return {
    locale: validLocale,  // 这行是关键！
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});