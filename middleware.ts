// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always' // 确保总是有 locale 前缀
});

export const config = {
  // Exclude debug pages, api, static files
  matcher: ['/((?!api|_next|_vercel|check-database|test-connection|test-notifications|.*\\..*).*)'],
};