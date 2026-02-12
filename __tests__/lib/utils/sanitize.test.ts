import { describe, it, expect } from 'vitest';
import { sanitizePlainText } from '@/lib/utils/sanitize';

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
