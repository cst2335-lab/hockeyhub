import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDateByLocale,
  formatDateTimeByLocale,
} from '@/lib/utils/format';

describe('formatCurrency', () => {
  it('formats number as CAD currency', () => {
    expect(formatCurrency(150)).toMatch(/\$150/);
  });

  it('handles string input', () => {
    expect(formatCurrency('99.99')).toMatch(/\$99\.99/);
  });

  it('returns formatted zero for null/undefined', () => {
    expect(formatCurrency(null)).toMatch(/\$0/);
    expect(formatCurrency(undefined)).toMatch(/\$0/);
  });
});

describe('formatDateByLocale', () => {
  it('formats date string', () => {
    const result = formatDateByLocale('2025-02-15T12:00:00.000Z', 'en');
    expect(result).toMatch(/Feb.*15.*2025/);
  });

  it('returns input for invalid date', () => {
    expect(formatDateByLocale('invalid')).toBe('invalid');
  });
});

describe('formatDateTimeByLocale', () => {
  it('formats date time string', () => {
    const result = formatDateTimeByLocale('2025-02-15T14:30:00', 'en');
    expect(result).toMatch(/Feb.*15.*2025/);
  });
});
