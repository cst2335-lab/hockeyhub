type PostgrestErrorLike = {
  code?: string | null;
  message?: string | null;
} | null | undefined;

type StripeWebhookEventsInsert = {
  from: (table: string) => {
    insert: (
      values: { stripe_event_id: string } | Array<{ stripe_event_id: string }>
    ) => PromiseLike<{ error: PostgrestErrorLike }>;
  };
};

export function isStripeWebhookAlreadyProcessedError(error: PostgrestErrorLike): boolean {
  if (!error) return false;
  return error.code === '23505' || /duplicate key/i.test(error.message ?? '');
}

export async function claimStripeWebhookEvent(
  supabase: StripeWebhookEventsInsert,
  stripeEventId: string
): Promise<'claimed' | 'duplicate'> {
  const { error } = await supabase
    .from('stripe_webhook_events')
    .insert({ stripe_event_id: stripeEventId });

  if (!error) return 'claimed';
  if (isStripeWebhookAlreadyProcessedError(error)) return 'duplicate';

  throw new Error(error.message ?? 'Failed to record stripe webhook event');
}
