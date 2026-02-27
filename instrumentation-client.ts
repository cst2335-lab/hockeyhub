/**
 * Client-side Sentry init for Next.js instrumentation-client convention.
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

// Enables router transition tracing in Next.js App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
