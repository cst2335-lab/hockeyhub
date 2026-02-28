/**
 * Input sanitization utilities for user-generated content.
 * Use when displaying or storing text that may contain HTML.
 */

const MAX_PLAIN_LENGTH = 10000;
const HTML_ESCAPE_RE = /[&<>"']/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Sanitize plain text for safe display/storage.
 * Strips control chars, trims, and limits length.
 */
export function sanitizePlainText(input: string | null | undefined): string {
  if (input == null || typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, MAX_PLAIN_LENGTH);
}

/**
 * Escape text before interpolation into HTML strings/templates.
 */
export function escapeHtml(input: string | null | undefined): string {
  return sanitizePlainText(input).replace(HTML_ESCAPE_RE, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/**
 * Sanitize text and return null when empty after normalization.
 */
export function sanitizeOptionalText(
  input: string | null | undefined,
  maxLength = MAX_PLAIN_LENGTH
): string | null {
  const normalized = sanitizePlainText(input).slice(0, Math.max(1, maxLength));
  return normalized === '' ? null : normalized;
}

/**
 * Normalize URL and only allow http(s).
 */
export function normalizeHttpUrl(
  input: string | null | undefined,
  maxLength = 2000
): string | null {
  const raw = sanitizeOptionalText(input, maxLength);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}
