import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '@/lib/utils/json-ld';

describe('serializeJsonLd', () => {
  it('escapes script-breaking characters', () => {
    const payload = {
      text: '</script><script>alert(1)</script>&',
    };
    const serialized = serializeJsonLd(payload);
    expect(serialized).toContain('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e\\u0026');
    expect(serialized.includes('</script>')).toBe(false);
  });
});
