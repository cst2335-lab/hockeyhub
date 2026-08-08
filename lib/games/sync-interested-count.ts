import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isActiveInterestStatus } from '@/lib/games/posted-metrics';

type DbClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Recount active interests and persist `interested_count` via service role
 * (creator-only RLS blocks non-owner updates on `game_invitations`).
 */
export async function syncInterestedCount(userClient: DbClient, gameId: string): Promise<number> {
  const { data: rows } = await userClient
    .from('game_interests')
    .select('status')
    .eq('game_id', gameId);

  const count = (rows ?? []).filter((r) => isActiveInterestStatus(r.status)).length;

  let writer: ReturnType<typeof createServiceClient> | DbClient = userClient;
  try {
    writer = createServiceClient();
  } catch (e) {
    console.error('syncInterestedCount service client unavailable:', e);
  }

  const { error } = await writer
    .from('game_invitations')
    .update({ interested_count: count })
    .eq('id', gameId);

  if (error) {
    console.error('syncInterestedCount update error:', error);
  }

  return count;
}
