import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

type Params = { locale: string; id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: game, error } = await supabase
    .from('game_invitations')
    .select('title, description, game_date, game_time, age_group, skill_level, location')
    .eq('id', id)
    .maybeSingle();

  if (error || !game) {
    return { title: 'Game Not Found | GoGoHockey' };
  }

  const title = (game.title as string) || 'Hockey Game';
  const desc =
    (game.description as string)?.slice(0, 160) ||
    `${game.game_date} ${game.game_time} – ${game.age_group} ${game.skill_level}${game.location ? ` at ${game.location}` : ''}. Find and join hockey games on GoGoHockey.`;

  return {
    title: `${title} | GoGoHockey`,
    description: desc,
    openGraph: {
      title: `${title} | GoGoHockey`,
      description: desc,
    },
  };
}

export default function GameIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
