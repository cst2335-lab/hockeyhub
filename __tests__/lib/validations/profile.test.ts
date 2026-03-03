import { describe, expect, it } from 'vitest';
import { updateProfileSchema } from '@/lib/validations/profile';

describe('updateProfileSchema', () => {
  it('accepts valid payload', () => {
    const result = updateProfileSchema.safeParse({
      full_name: 'Alex Chen',
      age_group: 'Adult',
      skill_level: 'B',
      position: 'Forward',
      area: 'Kanata',
      years_playing: 8,
      phone: '(613) 555-0100',
      jersey_number: '88',
      preferred_shot: 'Left',
      bio: 'Weekend hockey player.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid jersey number', () => {
    const result = updateProfileSchema.safeParse({
      full_name: 'Alex Chen',
      age_group: 'Adult',
      skill_level: 'B',
      position: 'Forward',
      area: 'Kanata',
      jersey_number: 'A12',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid area', () => {
    const result = updateProfileSchema.safeParse({
      full_name: 'Alex Chen',
      age_group: 'Adult',
      skill_level: 'B',
      position: 'Forward',
      area: 'Toronto',
    });
    expect(result.success).toBe(false);
  });
});
