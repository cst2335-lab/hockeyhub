import { sanitizePlainText } from '@/lib/utils/sanitize';

/**
 * Recursively sanitize string leaves in a JSON-LD object (DB/user-sourced text).
 * Primitives other than strings pass through; nested objects/arrays are walked.
 */
export function sanitizeJsonLdStrings(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return sanitizePlainText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((v) => sanitizeJsonLdStrings(v));
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj)) {
      out[k] = sanitizeJsonLdStrings(obj[k]);
    }
    return out;
  }
  return value;
}

/**
 * Safely serialize JSON-LD for <script type="application/ld+json"> usage.
 * Sanitizes string leaves, then escapes characters that can break out of script context.
 */
export function serializeJsonLd(value: unknown): string {
  const safe = sanitizeJsonLdStrings(value);
  return JSON.stringify(safe)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
