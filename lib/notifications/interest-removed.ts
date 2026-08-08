type NotifyClient = {
  from: (table: string) => {
    insert: (row: Record<string, unknown>) => PromiseLike<{ error: { message?: string } | null }>;
  };
};

/**
 * Notify the game creator that someone removed interest.
 * Failures are logged only — callers must not fail the remove-interest flow.
 */
export async function notifyInterestRemoved(params: {
  client: NotifyClient;
  creatorId: string;
  removerId: string;
  gameId: string;
  gameTitle: string | null | undefined;
}): Promise<{ notified: boolean; skipped?: string }> {
  const { client, creatorId, removerId, gameId, gameTitle } = params;

  if (!creatorId || creatorId === removerId) {
    return { notified: false, skipped: 'owner_or_missing' };
  }

  const title = (gameTitle || 'Untitled').trim() || 'Untitled';
  const { error } = await client.from('notifications').insert({
    user_id: creatorId,
    type: 'interest_removed',
    title: 'Interest removed',
    message: `A player removed interest from your game: ${title}`,
    link: `/games/${gameId}`,
    related_id: gameId,
    is_read: false,
  });

  if (error) {
    console.error('notifyInterestRemoved insert failed:', error);
    return { notified: false, skipped: 'insert_failed' };
  }

  return { notified: true };
}
