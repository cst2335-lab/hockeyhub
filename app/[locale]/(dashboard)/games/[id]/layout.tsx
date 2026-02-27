import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Params = { locale: string; id: string };
type GameSeoRow = {
  title: string | null;
  description: string | null;
  game_date: string | null;
  game_time: string | null;
  age_group: string | null;
  skill_level: string | null;
  location: string | null;
  status?: string | null;
};

async function getGameSeoRow(id: string): Promise<GameSeoRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('game_invitations')
    .select('title, description, game_date, game_time, age_group, skill_level, location, status')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data as GameSeoRow;
}

function buildSportsEventJsonLd(game: GameSeoRow) {
  const startDate =
    game.game_date && game.game_time
      ? `${game.game_date}T${String(game.game_time).slice(0, 5)}:00`
      : undefined;
  const description =
    game.description?.slice(0, 300) ||
    `${game.game_date ?? ''} ${game.game_time ?? ''} – ${game.age_group ?? ''} ${game.skill_level ?? ''}`.trim();

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: game.title || 'Hockey Game',
    description,
    ...(startDate ? { startDate } : {}),
    sport: 'Ice Hockey',
    eventStatus:
      game.status === 'cancelled'
        ? 'https://schema.org/EventCancelled'
        : game.status === 'closed'
          ? 'https://schema.org/EventPostponed'
          : 'https://schema.org/EventScheduled',
    organizer: {
      '@type': 'Organization',
      name: 'GoGoHockey',
    },
    ...(game.location
      ? {
          location: {
            '@type': 'Place',
            name: game.location,
            address: game.location,
          },
        }
      : {}),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameSeoRow(id);

  if (!game) {
    return { title: 'Game Not Found | GoGoHockey' };
  }

  const title = game.title || 'Hockey Game';
  const desc = game.description?.slice(0, 160) ||
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

export default async function GameIdLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { id } = await params;
  const game = await getGameSeoRow(id);
  const sportsEventJsonLd = game ? JSON.stringify(buildSportsEventJsonLd(game)) : null;

  return (
    <>
      {sportsEventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sportsEventJsonLd }}
        />
      )}
      {children}
    </>
  );
}
