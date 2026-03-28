import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { sanitizeMetadataDescription, serializeJsonLd } from '@/lib/utils/json-ld';
import { sanitizeOptionalText, sanitizePlainText } from '@/lib/utils/sanitize';

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
  const title = sanitizePlainText(game.title ?? '').slice(0, 120) || 'Hockey Game';
  const location = sanitizeOptionalText(game.location, 200);
  const ageGroup = sanitizeOptionalText(game.age_group, 40);
  const skillLevel = sanitizeOptionalText(game.skill_level, 40);
  const safeDescription = sanitizeMetadataDescription(game.description, 300);
  const description =
    safeDescription ||
    `${game.game_date ?? ''} ${game.game_time ?? ''} – ${ageGroup ?? ''} ${skillLevel ?? ''}`.trim();

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: title,
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
    ...(location
      ? {
          location: {
            '@type': 'Place',
            name: location,
            address: location,
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

  const title = sanitizePlainText(game.title ?? '').slice(0, 120) || 'Hockey Game';
  const safeDescription = sanitizeMetadataDescription(game.description, 160);
  const safeLocation = sanitizeOptionalText(game.location, 200);
  const safeAgeGroup = sanitizeOptionalText(game.age_group, 40);
  const safeSkillLevel = sanitizeOptionalText(game.skill_level, 40);
  const desc =
    safeDescription ||
    `${game.game_date} ${game.game_time} – ${safeAgeGroup ?? ''} ${safeSkillLevel ?? ''}${safeLocation ? ` at ${safeLocation}` : ''}. Find and join hockey games on GoGoHockey.`;

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
  const sportsEventJsonLd = game ? serializeJsonLd(buildSportsEventJsonLd(game)) : null;

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
