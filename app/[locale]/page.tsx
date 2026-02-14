// app/[locale]/page.tsx
import HeroSection from '@/components/features/hero-section';
import GameCard from '@/components/features/game-card-working';
import { Container } from '@/components/ui/container';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: games, error } = await supabase
    .from('game_invitations')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <main>
      <HeroSection />
      <section className="py-20 bg-background">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Recent Games</h2>
            <p className="text-xl text-gray-600">Join a game happening soon</p>
          </div>
          {games && games.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No games available at the moment.</p>
              <p className="text-sm text-gray-400 mt-2">Check back later or create your own game!</p>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
