/**
 * Client-side Sentry init for Next.js (Turbopack convention).
 * When using Turbopack, move the init from sentry.client.config.ts here.
 * Currently sentry.client.config.ts still holds the init for webpack builds.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1 : 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    environment: process.env.NODE_ENV,
  });
}
