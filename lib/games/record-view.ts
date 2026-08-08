/**
 * Pure helpers for game detail view recording.
 * Unique viewer/game pairs are tracked via `game_views` when available;
 * `view_count` on `game_invitations` remains the denormalized UI counter.
 */

export type ViewRecordDecision = 'owner' | 'already_viewed' | 'record';

export function decideGameViewRecord(params: {
  viewerId: string;
  creatorId: string | null | undefined;
  alreadyViewed: boolean;
}): ViewRecordDecision {
  if (params.creatorId && params.creatorId === params.viewerId) {
    return 'owner';
  }
  if (params.alreadyViewed) {
    return 'already_viewed';
  }
  return 'record';
}

export function nextViewCount(currentCount: number, decision: ViewRecordDecision): number {
  const base = Number(currentCount) || 0;
  return decision === 'record' ? base + 1 : base;
}
