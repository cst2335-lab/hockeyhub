import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { createClubSchema } from '@/lib/validations/club';
import { normalizeHttpUrl, sanitizeOptionalText, sanitizePlainText } from '@/lib/utils/sanitize';

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

  const parsed = createClubSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid club payload',
        errorCode: 'INVALID_CLUB_CREATE_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const valid = parsed.data;
  const sanitizedName = sanitizePlainText(valid.name).slice(0, 120);
  const sanitizedDescription = sanitizeOptionalText(valid.description, 1000);
  const sanitizedEmail = sanitizePlainText(valid.contact_email).slice(0, 254).toLowerCase();
  const sanitizedPhone = sanitizeOptionalText(valid.contact_phone, 40);
  const sanitizedHomeRink = sanitizeOptionalText(valid.home_rink, 120);
  const normalizedWebsite = normalizeHttpUrl(valid.website, 2000);
  const normalizedAgeGroups = valid.age_groups.join(',');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clubs')
    .insert({
      name: sanitizedName,
      description: sanitizedDescription,
      contact_email: sanitizedEmail,
      contact_phone: sanitizedPhone,
      website: normalizedWebsite,
      founded_year: valid.founded_year,
      home_rink: sanitizedHomeRink,
      age_groups: normalizedAgeGroups,
      manager_id: user.id,
      verified: false,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Create club API error:', error);
    return NextResponse.json(
      { error: 'Failed to create club', errorCode: 'CLUB_CREATE_FAILED' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
