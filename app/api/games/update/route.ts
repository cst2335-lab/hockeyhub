import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { updateGameSchema } from '@/lib/validations/game';
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

  const parsed = updateGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid game update payload',
        errorCode: 'INVALID_GAME_UPDATE_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const valid = parsed.data;
  const sanitizedTitle = sanitizePlainText(valid.title).slice(0, 100);
  const sanitizedLocation = sanitizePlainText(valid.location).slice(0, 200);
  const sanitizedDescription = sanitizeOptionalText(valid.description ?? '', 1000);
  const sanitizedContact = sanitizeOptionalText(valid.contact_info ?? '', 200);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('game_invitations')
    .update({
      title: sanitizedTitle,
      game_date: valid.game_date,
      game_time: valid.game_time,
      location: sanitizedLocation,
      age_group: valid.age_group,
      skill_level: valid.skill_level,
      description: sanitizedDescription,
      max_players: valid.max_players ? parseInt(valid.max_players, 10) : null,
      contact_info: sanitizedContact,
      status: valid.status,
    })
    .eq('id', valid.gameId)
    .eq('created_by', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Update game API error:', error);
    return NextResponse.json(
      { error: 'Failed to update game', errorCode: 'UPDATE_GAME_FAILED' },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Game not found or unauthorized', errorCode: 'GAME_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
