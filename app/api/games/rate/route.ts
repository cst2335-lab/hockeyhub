import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { gameRatingSchema } from '@/lib/validations/game';
import { sanitizeOptionalText } from '@/lib/utils/sanitize';

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

  const parsed = gameRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid rating payload',
        errorCode: 'INVALID_RATING_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { gameId, rating, comment } = parsed.data;
  const safeComment = sanitizeOptionalText(comment ?? '', 500);
  const supabase = await createClient();

  const { data: game, error: gameError } = await supabase
    .from('game_invitations')
    .select('id, created_by, status')
    .eq('id', gameId)
    .maybeSingle();
  if (gameError || !game) {
    return NextResponse.json(
      { error: 'Game not found', errorCode: 'GAME_NOT_FOUND' },
      { status: 404 }
    );
  }
  if (game.status !== 'matched') {
    return NextResponse.json(
      { error: 'Ratings are only allowed for matched games', errorCode: 'RATING_NOT_ALLOWED' },
      { status: 400 }
    );
  }

  let opponentId: string | null = null;
  if (game.created_by === user.id) {
    const { data: accepted } = await supabase
      .from('game_interests')
      .select('user_id')
      .eq('game_id', gameId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (accepted?.user_id) {
      opponentId = accepted.user_id;
    } else {
      const { data: anyInterest } = await supabase
        .from('game_interests')
        .select('user_id')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      opponentId = anyInterest?.user_id ?? null;
    }
  } else {
    opponentId = game.created_by;
  }

  if (!opponentId || opponentId === user.id) {
    return NextResponse.json(
      { error: 'Cannot determine opponent', errorCode: 'OPPONENT_NOT_FOUND' },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from('game_ratings')
    .select('id')
    .eq('game_id', gameId)
    .eq('rater_id', user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'Rating already submitted', errorCode: 'RATING_ALREADY_EXISTS' },
      { status: 409 }
    );
  }

  const { error: insertError } = await supabase
    .from('game_ratings')
    .insert({
      game_id: gameId,
      rater_id: user.id,
      rated_user_id: opponentId,
      rating,
      comment: safeComment,
    });
  if (insertError) {
    console.error('Create game rating API error:', insertError);
    return NextResponse.json(
      { error: 'Failed to submit rating', errorCode: 'CREATE_RATING_FAILED' },
      { status: 500 }
    );
  }

  const { data: ratings } = await supabase
    .from('game_ratings')
    .select('rating')
    .eq('rated_user_id', opponentId);
  if (ratings && ratings.length > 0) {
    const avg = ratings.reduce((sum, row) => sum + Number(row.rating || 0), 0) / ratings.length;
    const serviceClient = createServiceClient();
    await serviceClient
      .from('profiles')
      .update({
        average_rating: avg,
        total_ratings: ratings.length,
      })
      .eq('id', opponentId);
  }

  return NextResponse.json({ ok: true });
}
