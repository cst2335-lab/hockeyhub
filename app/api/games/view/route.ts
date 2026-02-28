import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { gameViewSchema } from '@/lib/validations/game';

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

  const parsed = gameViewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid view payload',
        errorCode: 'INVALID_GAME_VIEW_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { gameId } = parsed.data;
  const supabase = await createClient();
  const { data: game, error: gameError } = await supabase
    .from('game_invitations')
    .select('id, created_by, view_count')
    .eq('id', gameId)
    .maybeSingle();

  if (gameError || !game) {
    return NextResponse.json(
      { error: 'Game not found', errorCode: 'GAME_NOT_FOUND' },
      { status: 404 }
    );
  }

  if (game.created_by === user.id) {
    return NextResponse.json({ ok: true, skipped: 'owner' });
  }

  const currentCount = Number(game.view_count || 0);
  const { error: updateError } = await supabase
    .from('game_invitations')
    .update({ view_count: currentCount + 1 })
    .eq('id', gameId);

  if (updateError) {
    console.error('Update game view API error:', updateError);
    return NextResponse.json(
      { error: 'Failed to update view count', errorCode: 'GAME_VIEW_UPDATE_FAILED' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, viewCount: currentCount + 1 });
}
