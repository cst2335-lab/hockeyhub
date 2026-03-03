import { describe, expect, it } from 'vitest';
import { createClubSchema } from '@/lib/validations/club';

describe('createClubSchema', () => {
  it('accepts valid payload and deduplicates age groups', () => {
    const result = createClubSchema.safeParse({
      name: 'Ottawa Knights Hockey Club',
      description: 'Community-first youth hockey club',
      contact_email: 'info@ottawaknights.ca',
      contact_phone: '(613) 555-0100',
      website: 'https://ottawaknights.ca',
      founded_year: `${new Date().getFullYear()}`,
      home_rink: 'Bell Sensplex',
      age_groups: ['U11', 'U13', 'U11'],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.age_groups).toEqual(['U11', 'U13']);
  });

  it('rejects invalid contact email', () => {
    const result = createClubSchema.safeParse({
      name: 'Ottawa Knights Hockey Club',
      contact_email: 'not-an-email',
      founded_year: '2020',
    });
    expect(result.success).toBe(false);
  });

  it('rejects future founded year', () => {
    const result = createClubSchema.safeParse({
      name: 'Ottawa Knights Hockey Club',
      contact_email: 'info@ottawaknights.ca',
      founded_year: `${new Date().getFullYear() + 1}`,
    });
    expect(result.success).toBe(false);
  });
});
