import type { ReactNode } from 'react';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchRinksListQuery } from '@/lib/queries/rinks';
import { createPublicServerClient } from '@/lib/supabase/public-server';

export default async function RinksListLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  try {
    const supabase = createPublicServerClient();
    await queryClient.prefetchQuery({
      queryKey: ['rinks'],
      queryFn: () => fetchRinksListQuery(supabase),
    });
  } catch (error) {
    console.error('Failed to prefetch rinks for hydration:', error);
  }

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
