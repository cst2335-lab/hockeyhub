// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always' // 确保总是有 locale 前缀
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};