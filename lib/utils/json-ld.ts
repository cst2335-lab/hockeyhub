/**
 * Safely serialize JSON-LD for <script type="application/ld+json"> usage.
 * Escapes characters that can break out of script context.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Sanitize a metadata description to keep SEO snippets stable.
 * Returns undefined when input is empty after normalization.
 */
export function sanitizeMetadataDescription(
  value: string | null | undefined,
  maxLength = 300
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, Math.max(1, maxLength));
  return normalized || undefined;
}
