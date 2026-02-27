export function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function shouldAuthorizeCronRequest(params: {
  nodeEnv: string | undefined;
  testMode: boolean;
  providedToken: string | null;
  expectedToken: string | undefined;
}): { allowed: boolean; reason?: string } {
  const { nodeEnv, testMode, providedToken, expectedToken } = params;
  const isProduction = nodeEnv === 'production';
  const requiresAuth = isProduction || !testMode;

  if (!requiresAuth) {
    return { allowed: true };
  }

  if (!expectedToken) {
    return { allowed: false, reason: 'CRON_SECRET is not configured' };
  }

  if (!providedToken || providedToken !== expectedToken) {
    return { allowed: false, reason: 'Invalid or missing bearer token' };
  }

  return { allowed: true };
}
