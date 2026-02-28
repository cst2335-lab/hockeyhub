import { describe, expect, it } from 'vitest';
import { getCancellationPolicyHtml, getCancellationPolicyText } from '@/lib/booking/policy-copy';

describe('policy copy helpers', () => {
  it('returns readable plain-text policy', () => {
    const text = getCancellationPolicyText();
    expect(text).toContain('24+ hours');
    expect(text).toContain('50%');
  });

  it('returns html snippet with list items', () => {
    const html = getCancellationPolicyHtml();
    expect(html).toContain('<ul');
    expect(html).toContain('Cancellation policy');
  });
});

