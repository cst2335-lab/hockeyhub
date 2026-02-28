import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  normalizeHttpUrl,
  sanitizeOptionalText,
  sanitizePlainText,
} from '@/lib/utils/sanitize';

describe('sanitizePlainText', () => {
  it('returns empty for null/undefined', () => {
    expect(sanitizePlainText(null)).toBe('');
    expect(sanitizePlainText(undefined)).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizePlainText('  hello  ')).toBe('hello');
  });

  it('strips control characters', () => {
    expect(sanitizePlainText('a\x00b\x1Fc')).toBe('abc');
  });

  it('limits length to 10000', () => {
    const long = 'a'.repeat(15000);
    expect(sanitizePlainText(long).length).toBe(10000);
  });
});

describe('escapeHtml', () => {
  it('escapes html special chars', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
  });
});

describe('sanitizeOptionalText', () => {
  it('returns null for empty-ish values', () => {
    expect(sanitizeOptionalText('   ')).toBeNull();
  });

  it('returns sanitized value when present', () => {
    expect(sanitizeOptionalText('  hello\x00  ')).toBe('hello');
  });
});

describe('normalizeHttpUrl', () => {
  it('returns normalized https URL', () => {
    expect(normalizeHttpUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('rejects non-http protocols', () => {
    expect(normalizeHttpUrl('javascript:alert(1)')).toBeNull();
  });
});
