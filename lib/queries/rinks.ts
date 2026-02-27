export type Rink = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  phone: string | null;
  hourly_rate: number | string | null;
  amenities: string[] | null;
  booking_url: string | null;
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
    .select('id, name, address, city, phone, hourly_rate, amenities, booking_url')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message ?? 'Failed to load rinks');
  return (data as Rink[]) ?? [];
}
