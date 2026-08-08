import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  countByGameId,
  isActiveInterestStatus,
  type LiveMetricCounts,
} from '@/lib/games/posted-metrics';

/**
 * Live view + interest counts for the authenticated user's posted games.
 * Views are read via service role because `game_views` has RLS without SELECT policies.
 * Interests are counted from `game_interests` (active statuses only).
 */
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const user = auth.user!;

  const supabase = await createClient();
  const { data: games, error: gamesError } = await supabase
    .from('game_invitations')
    .select('id')
    .eq('created_by', user.id);

  if (gamesError) {
    console.error('posted-metrics games fetch error:', gamesError);
    return NextResponse.json(
      { error: 'Failed to load posted games', errorCode: 'POSTED_METRICS_FAILED' },
      { status: 500 }
    );
  }

  const gameIds = (games ?? []).map((g) => g.id as string);
  if (gameIds.length === 0) {
    return NextResponse.json({ metrics: {} as Record<string, LiveMetricCounts> });
  }

  let writer: ReturnType<typeof createServiceClient> | typeof supabase = supabase;
  try {
    writer = createServiceClient();
  } catch (e) {
    console.error('posted-metrics service client unavailable:', e);
  }

  const [viewsRes, interestsRes] = await Promise.all([
    writer.from('game_views').select('game_id').in('game_id', gameIds),
    supabase.from('game_interests').select('game_id, status').in('game_id', gameIds),
  ]);

  if (viewsRes.error) {
    console.error('posted-metrics views fetch error:', viewsRes.error);
  }
  if (interestsRes.error) {
    console.error('posted-metrics interests fetch error:', interestsRes.error);
  }

  const viewCounts = countByGameId((viewsRes.data ?? []) as Array<{ game_id: string }>);
  const interestCounts = countByGameId(
    (interestsRes.data ?? []) as Array<{ game_id: string; status?: string }>,
    (row) => isActiveInterestStatus(row.status as string | undefined)
  );

  const metrics: Record<string, LiveMetricCounts> = {};
  for (const id of gameIds) {
    metrics[id] = {
      viewCount: viewCounts[id] ?? 0,
      interestedCount: interestCounts[id] ?? 0,
    };
  }

  return NextResponse.json({ metrics });
}
