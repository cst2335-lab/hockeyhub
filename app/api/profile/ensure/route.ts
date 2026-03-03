import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { ensureProfileSchema } from '@/lib/validations/profile';
import { sanitizePlainText } from '@/lib/utils/sanitize';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const user = auth.user!;

  let body: unknown = {};
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', errorCode: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const parsed = ensureProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid ensure profile payload',
        errorCode: 'INVALID_PROFILE_ENSURE_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const fallbackName =
    parsed.data.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Hockey Player';

  const sanitizedName = sanitizePlainText(String(fallbackName)).slice(0, 120) || 'Hockey Player';

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: sanitizedName,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (error || !data) {
    console.error('Ensure profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to ensure profile', errorCode: 'PROFILE_ENSURE_FAILED' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, profile: data });
}
