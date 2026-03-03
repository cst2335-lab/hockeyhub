import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { updateProfileSchema } from '@/lib/validations/profile';
import { sanitizeOptionalText, sanitizePlainText } from '@/lib/utils/sanitize';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const user = auth.user!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', errorCode: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid profile payload',
        errorCode: 'INVALID_PROFILE_UPDATE_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const valid = parsed.data;
  const sanitizedName = sanitizePlainText(valid.full_name).slice(0, 120);
  const sanitizedPhone = sanitizeOptionalText(valid.phone, 40);
  const sanitizedJersey = sanitizeOptionalText(valid.jersey_number, 3);
  const sanitizedBio = sanitizeOptionalText(valid.bio, 1000);
  const normalizedShot = valid.preferred_shot === '' ? null : valid.preferred_shot;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: sanitizedName,
        age_group: valid.age_group,
        skill_level: valid.skill_level,
        position: valid.position,
        area: valid.area,
        years_playing: valid.years_playing,
        phone: sanitizedPhone,
        jersey_number: sanitizedJersey,
        preferred_shot: normalizedShot,
        bio: sanitizedBio,
      },
      { onConflict: 'id' }
    )
    .select('id')
    .single();

  if (error || !data) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', errorCode: 'PROFILE_UPDATE_FAILED' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
