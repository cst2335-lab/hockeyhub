import { describe, expect, it } from 'vitest';
import { sanitizeJsonLdStrings, serializeJsonLd } from '@/lib/utils/json-ld';

describe('sanitizeJsonLdStrings', () => {
  it('strips control characters from nested strings', () => {
    const input = {
      '@context': 'https://schema.org',
      name: 'Test\x00Event',
      nested: { title: 'A\u0001B' },
    };
    const out = sanitizeJsonLdStrings(input) as Record<string, unknown>;
    expect(out.name).toBe('TestEvent');
    expect((out.nested as { title: string }).title).toBe('AB');
  });

  it('preserves numbers and boolean', () => {
    expect(sanitizeJsonLdStrings({ n: 1, b: true })).toEqual({ n: 1, b: true });
  });
});

describe('serializeJsonLd', () => {
  it('escapes angle brackets in output so script tags cannot break out', () => {
    const malicious = { '@type': 'Thing', name: '</script><script>alert(1)</script>' };
    const s = serializeJsonLd(malicious);
    expect(s).not.toContain('</script>');
    expect(s).toContain('\\u003c');
  });
});
