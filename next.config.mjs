// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Externalize OpenTelemetry to avoid "Cannot find module './vendor-chunks/@opentelemetry.js'"
  // in deployment contexts (standalone, serverless) where chunk path resolution can fail.
  serverExternalPackages: ['@opentelemetry/api'],
  async redirects() {
    return [
      { source: '/:locale/my-games', destination: '/:locale/dashboard', permanent: true },
      { source: '/:locale/my-games/:path*', destination: '/:locale/dashboard', permanent: true },
      { source: '/:locale/bookings', destination: '/:locale/dashboard', permanent: true },
      // /bookings/:id stays - users click from dashboard to view booking details
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

const config = withNextIntl(nextConfig);
export default withSentryConfig(config, {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});