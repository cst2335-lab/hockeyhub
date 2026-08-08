import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { decideGameViewRecord, nextViewCount } from '@/lib/games/record-view';
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

  const currentCount = Number(game.view_count || 0);

  // Prefer service client: RLS only allows creators to UPDATE game_invitations,
  // and game_views has RLS enabled without public insert policies.
  let writer: ReturnType<typeof createServiceClient> | Awaited<ReturnType<typeof createClient>>;
  try {
    writer = createServiceClient();
  } catch (e) {
    console.error('Game view service client unavailable, falling back to user client:', e);
    writer = supabase;
  }

  const { data: existingView } = await writer
    .from('game_views')
    .select('id')
    .eq('game_id', gameId)
    .eq('viewer_id', user.id)
    .maybeSingle();

  const decision = decideGameViewRecord({
    viewerId: user.id,
    creatorId: game.created_by,
    alreadyViewed: !!existingView,
  });

  if (decision !== 'record') {
    return NextResponse.json({
      ok: true,
      skipped: decision,
      viewCount: currentCount,
    });
  }

  const { error: insertViewError } = await writer.from('game_views').insert({
    game_id: gameId,
    viewer_id: user.id,
  });

  if (insertViewError) {
    // Prefer continuing with view_count update so demo views still work when
    // game_views writes are blocked; unique races are uncommon without a DB constraint.
    console.error('Insert game_views error (continuing with view_count):', insertViewError);
  }

  const viewCount = nextViewCount(currentCount, decision);
  const { error: updateError } = await writer
    .from('game_invitations')
    .update({ view_count: viewCount })
    .eq('id', gameId);

  if (updateError) {
    console.error('Update game view API error:', updateError);
    return NextResponse.json(
      { error: 'Failed to update view count', errorCode: 'GAME_VIEW_UPDATE_FAILED' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, viewCount });
}
