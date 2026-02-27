import type { ReactNode } from 'react';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchGamesListQuery } from '@/lib/queries/games';
import { createPublicServerClient } from '@/lib/supabase/public-server';

export default async function GamesListLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  try {
    const supabase = createPublicServerClient();
    await queryClient.prefetchQuery({
      queryKey: ['games'],
      queryFn: () => fetchGamesListQuery(supabase),
    });
  } catch (error) {
    console.error('Failed to prefetch games for hydration:', error);
  }

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
