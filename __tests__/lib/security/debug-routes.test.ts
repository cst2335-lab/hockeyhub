import { describe, expect, it } from 'vitest';
import { DEBUG_ROUTES, isDebugRoute } from '@/lib/security/debug-routes';

describe('isDebugRoute', () => {
  it('matches exact debug routes', () => {
    for (const route of DEBUG_ROUTES) {
      expect(isDebugRoute(route)).toBe(true);
    }
  });

  it('matches nested debug routes', () => {
    expect(isDebugRoute('/check-database/details')).toBe(true);
    expect(isDebugRoute('/test-connection/run/1')).toBe(true);
  });

  it('does not match normal routes', () => {
    expect(isDebugRoute('/en/dashboard')).toBe(false);
    expect(isDebugRoute('/api/webhooks/stripe')).toBe(false);
  });
});
