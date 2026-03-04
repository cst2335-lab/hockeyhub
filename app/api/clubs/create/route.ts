import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { createClubSchema } from '@/lib/validations/club';
import { normalizeHttpUrl, sanitizeOptionalText, sanitizePlainText } from '@/lib/utils/sanitize';

type OptionalClubColumns = Record<
  'description' | 'contact_phone' | 'website' | 'founded_year' | 'home_rink' | 'age_groups' | 'manager_id' | 'verified',
  boolean
>;

function isMissingColumnError(message: string | null | undefined): boolean {
  const normalized = (message ?? '').toLowerCase();
  return normalized.includes('column') && normalized.includes('does not exist');
}

async function detectOptionalClubColumns(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<OptionalClubColumns> {
  const optionalColumns: OptionalClubColumns = {
    description: true,
    contact_phone: true,
    website: true,
    founded_year: true,
    home_rink: true,
    age_groups: true,
    manager_id: true,
    verified: true,
  };

  for (const column of Object.keys(optionalColumns) as Array<keyof OptionalClubColumns>) {
    const { error } = await supabase.from('clubs').select(column).limit(1);
    if (!error) continue;
    if (isMissingColumnError(error.message)) {
      optionalColumns[column] = false;
      continue;
    }
    console.warn(`[clubs/create] optional column probe warning for ${column}: ${error.message}`);
  }

  return optionalColumns;
}

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
  const optionalColumns = await detectOptionalClubColumns(supabase);
  const insertPayload: Record<string, unknown> = {
    name: sanitizedName,
    contact_email: sanitizedEmail,
  };
  if (optionalColumns.description) insertPayload.description = sanitizedDescription;
  if (optionalColumns.contact_phone) insertPayload.contact_phone = sanitizedPhone;
  if (optionalColumns.website) insertPayload.website = normalizedWebsite;
  if (optionalColumns.founded_year) insertPayload.founded_year = valid.founded_year;
  if (optionalColumns.home_rink) insertPayload.home_rink = sanitizedHomeRink;
  if (optionalColumns.age_groups) insertPayload.age_groups = normalizedAgeGroups;
  if (optionalColumns.manager_id) insertPayload.manager_id = user.id;
  if (optionalColumns.verified) insertPayload.verified = false;

  const { data, error } = await supabase
    .from('clubs')
    .insert(insertPayload)
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
