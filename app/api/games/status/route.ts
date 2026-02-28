import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { gameStatusUpdateSchema } from '@/lib/validations/game';

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

  const parsed = gameStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid status payload',
        errorCode: 'INVALID_GAME_STATUS_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { gameId, status } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('game_invitations')
    .update({ status })
    .eq('id', gameId)
    .eq('created_by', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Update game status API error:', error);
    return NextResponse.json(
      { error: 'Failed to update game status', errorCode: 'GAME_STATUS_UPDATE_FAILED' },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Game not found or unauthorized', errorCode: 'GAME_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
