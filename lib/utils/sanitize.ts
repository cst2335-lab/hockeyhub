/**
 * Input sanitization utilities for user-generated content.
 * Use when displaying or storing text that may contain HTML.
 */

const MAX_PLAIN_LENGTH = 10000;

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
