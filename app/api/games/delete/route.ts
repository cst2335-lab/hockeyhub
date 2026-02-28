import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { deleteGameSchema } from '@/lib/validations/game';

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

  const parsed = deleteGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid delete payload',
        errorCode: 'INVALID_GAME_DELETE_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { gameId } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('game_invitations')
    .delete()
    .eq('id', gameId)
    .eq('created_by', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Delete game API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete game', errorCode: 'GAME_DELETE_FAILED' },
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
