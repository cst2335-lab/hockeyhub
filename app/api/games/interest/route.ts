import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { gameInterestSchema } from '@/lib/validations/game';
import { sanitizeOptionalText } from '@/lib/utils/sanitize';

async function syncInterestedCount(supabase: Awaited<ReturnType<typeof createClient>>, gameId: string) {
  const { count } = await supabase
    .from('game_interests')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);

  await supabase
    .from('game_invitations')
    .update({ interested_count: count ?? 0 })
    .eq('id', gameId);

  return count ?? 0;
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

  const parsed = gameInterestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid interest payload',
        errorCode: 'INVALID_INTEREST_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { gameId, message } = parsed.data;
  const safeMessage = sanitizeOptionalText(message ?? '', 1000);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('game_interests')
    .select('id')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (existing) {
    const interestedCount = await syncInterestedCount(supabase, gameId);
    return NextResponse.json({ ok: true, alreadyInterested: true, interestedCount });
  }

  const { error: insertError } = await supabase
    .from('game_interests')
    .insert({
      game_id: gameId,
      user_id: user.id,
      message: safeMessage,
      status: 'pending',
    });

  if (insertError) {
    console.error('Create game interest API error:', insertError);
    return NextResponse.json(
      { error: 'Failed to save interest', errorCode: 'CREATE_INTEREST_FAILED' },
      { status: 500 }
    );
  }

  const interestedCount = await syncInterestedCount(supabase, gameId);
  return NextResponse.json({ ok: true, interestedCount });
}

export async function DELETE(request: NextRequest) {
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

  const parsed = gameInterestSchema.pick({ gameId: true }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid interest payload',
        errorCode: 'INVALID_INTEREST_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { gameId } = parsed.data;
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from('game_interests')
    .delete()
    .eq('game_id', gameId)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Delete game interest API error:', deleteError);
    return NextResponse.json(
      { error: 'Failed to remove interest', errorCode: 'DELETE_INTEREST_FAILED' },
      { status: 500 }
    );
  }

  const interestedCount = await syncInterestedCount(supabase, gameId);
  return NextResponse.json({ ok: true, interestedCount });
}
