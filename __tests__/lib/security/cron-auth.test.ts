import { describe, expect, it } from 'vitest';
import { extractBearerToken, shouldAuthorizeCronRequest } from '@/lib/security/cron-auth';

describe('extractBearerToken', () => {
  it('extracts token from Bearer header', () => {
    expect(extractBearerToken('Bearer abc123')).toBe('abc123');
  });

  it('is case-insensitive and trims spaces', () => {
    expect(extractBearerToken('bearer   abc123  ')).toBe('abc123');
  });

  it('returns null for invalid headers', () => {
    expect(extractBearerToken('Basic abc')).toBeNull();
    expect(extractBearerToken(null)).toBeNull();
  });
});

describe('shouldAuthorizeCronRequest', () => {
  it('allows non-production test mode without token', () => {
    const result = shouldAuthorizeCronRequest({
      nodeEnv: 'development',
      testMode: true,
      providedToken: null,
      expectedToken: undefined,
    });
    expect(result.allowed).toBe(true);
  });

  it('requires token in production even test mode', () => {
    const result = shouldAuthorizeCronRequest({
      nodeEnv: 'production',
      testMode: true,
      providedToken: null,
      expectedToken: 'secret',
    });
    expect(result.allowed).toBe(false);
  });

  it('requires token in non-test runs', () => {
    const result = shouldAuthorizeCronRequest({
      nodeEnv: 'development',
      testMode: false,
      providedToken: null,
      expectedToken: 'secret',
    });
    expect(result.allowed).toBe(false);
  });

  it('allows matching bearer token', () => {
    const result = shouldAuthorizeCronRequest({
      nodeEnv: 'production',
      testMode: false,
      providedToken: 'secret',
      expectedToken: 'secret',
    });
    expect(result.allowed).toBe(true);
  });
});
