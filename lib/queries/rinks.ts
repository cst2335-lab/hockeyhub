export type Rink = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  phone: string | null;
  hourly_rate: number | string | null;
  amenities: string[] | null;
  booking_url: string | null;
  source?: string | null;
  data_source?: string | null;
  last_synced_at?: string | null;
  last_synced?: string | null;
  image_url?: string | null;
  image_verified?: boolean | null;
};

type PostgrestErrorLike = { message?: string | null } | null;
type PostgrestResponse<T> = { data: T | null; error: PostgrestErrorLike };

type RinksQueryBuilder = {
  select: (columns: string) => {
    order: (
      column: string,
      options?: { ascending?: boolean }
    ) => PromiseLike<PostgrestResponse<Array<Record<string, unknown>>>>;
  };
};

type SupabaseRinksClient = {
  from: (table: 'rinks') => RinksQueryBuilder;
};

export async function fetchRinksListQuery(supabase: SupabaseRinksClient): Promise<Rink[]> {
  const { data, error } = await supabase
    .from('rinks')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message ?? 'Failed to load rinks');

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows.map((row) => {
    const typed = row as Rink;
    const legacyLastSynced = (row.last_synced as string | null | undefined) ?? null;
    const nextLastSyncedAt = (row.last_synced_at as string | null | undefined) ?? legacyLastSynced;
    return {
      ...typed,
      last_synced: legacyLastSynced,
      last_synced_at: nextLastSyncedAt,
    };
  });
}
