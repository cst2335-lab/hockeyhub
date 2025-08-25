import HeroSection from '@/components/features/hero-section';
import GameCard from '@/components/features/game-card-working';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function HomePage() {
  // Fetch recent games with debug logging
  const { data: games, error } = await supabase
    .from('game_invitations')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(6); // Changed to show all 6 games

  // Debug: Log the results
  console.log('Games fetched:', games);
  console.log('Error:', error);

  return (
    <main>
      <HeroSection />
      
      {/* Debug section to show data */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Debug Info:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            Games count: {games ? games.length : 0}
            <br />
            Error: {error ? JSON.stringify(error) : 'None'}
            <br />
            First game: {games && games[0] ? games[0].title : 'No games'}
          </pre>
        </div>
      </section>
      
      {/* Recent games section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
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
              <p className="text-gray-500">No games found. Check if data exists in database.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}