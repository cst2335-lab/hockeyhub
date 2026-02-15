// app/[locale]/page.tsx
import dynamic from 'next/dynamic';
import { HomePlatformSection } from '@/components/features/home-platform-section';
import { HomeCTASection } from '@/components/features/home-cta-section';
import { Container } from '@/components/ui/container';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

const HeroSection = dynamic(
  () => import('@/components/features/hero-section').then((m) => m.default),
  { ssr: true }
);

const GameCard = dynamic(
  () => import('@/components/features/game-card-working').then((m) => m.default),
  { ssr: true }
);

export default async function HomePage() {
  const t = await getTranslations('home');
  const supabase = await createClient();
  const { data: games } = await supabase
    .from('game_invitations')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <main>
      <HeroSection />
      <HomePlatformSection />
      <HomeCTASection />
      <section className="py-20 bg-background">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('recentGames')}</h2>
            <p className="text-xl text-muted-foreground">{t('recentGamesSubtitle')}</p>
          </div>
          {games && games.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('noGames')}</p>
              <p className="text-sm text-muted-foreground/80 mt-2">{t('noGamesHint')}</p>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
