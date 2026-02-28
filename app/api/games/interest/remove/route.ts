import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { removeGameInterestSchema } from '@/lib/validations/game';

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

  const parsed = removeGameInterestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid remove-interest payload',
        errorCode: 'INVALID_INTEREST_REMOVE_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { interestId } = parsed.data;
  const supabase = await createClient();
  const { data: interest, error: fetchError } = await supabase
    .from('game_interests')
    .select('id, game_id')
    .eq('id', interestId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    console.error('Fetch game interest API error:', fetchError);
    return NextResponse.json(
      { error: 'Failed to remove interest', errorCode: 'INTEREST_REMOVE_FAILED' },
      { status: 500 }
    );
  }
  if (!interest) {
    return NextResponse.json(
      { error: 'Interest not found', errorCode: 'INTEREST_NOT_FOUND' },
      { status: 404 }
    );
  }

  const { error: deleteError } = await supabase
    .from('game_interests')
    .delete()
    .eq('id', interestId)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Delete game interest API error:', deleteError);
    return NextResponse.json(
      { error: 'Failed to remove interest', errorCode: 'INTEREST_REMOVE_FAILED' },
      { status: 500 }
    );
  }

  const { count } = await supabase
    .from('game_interests')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', interest.game_id);
  await supabase
    .from('game_invitations')
    .update({ interested_count: count ?? 0 })
    .eq('id', interest.game_id);

  return NextResponse.json({ ok: true });
}
