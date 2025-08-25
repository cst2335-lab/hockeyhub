'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function GamesTestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    testDatabase();
  }, []);

  async function testDatabase() {
    console.log('=== GAMES TEST PAGE LOADED ===');
    console.log('Time:', new Date().toISOString());
    
    const supabase = createClient();
    
    try {
      // Test 1: Basic query
      console.log('Test 1: Basic query...');
      const { data: games, error: gamesError } = await supabase
        .from('game_invitations')
        .select('id, title, status, game_date')
        .limit(10);
      
      console.log('Query result:', { games, gamesError });
      
      // Test 2: Count
      const { count, error: countError } = await supabase
        .from('game_invitations')
        .select('*', { count: 'exact', head: true });
      
      console.log('Total count:', { count, countError });
      
      // Test 3: Open games
      const { data: openGames, error: openError } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('status', 'open');
      
      console.log('Open games:', { openGames: openGames?.length, openError });
      
      setData({
        allGames: games,
        totalCount: count,
        openGames: openGames,
        errors: {
          games: gamesError,
          count: countError,
          open: openError
        }
      });
      
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8">Loading test...</div>;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="font-mono text-sm">Check browser console for detailed logs</p>
        <p className="text-xs text-gray-500 mt-2">Page loaded at: {new Date().toISOString()}</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <pre className="text-xs">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {data && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Results:</h2>
            <ul className="space-y-2 text-sm">
              <li>Total games in DB: <span className="font-mono">{data.totalCount || 0}</span></li>
              <li>Games returned: <span className="font-mono">{data.allGames?.length || 0}</span></li>
              <li>Open games: <span className="font-mono">{data.openGames?.length || 0}</span></li>
            </ul>
          </div>
          
          {data.openGames && data.openGames.length > 0 && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold mb-2">Open Games:</h2>
              <div className="space-y-2">
                {data.openGames.map((game: any) => (
                  <div key={game.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-semibold">{game.title || 'No title'}</p>
                    <p className="text-sm text-gray-600">
                      {game.game_date} | {game.age_group} - {game.skill_level}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <details className="bg-white p-4 rounded shadow">
            <summary className="cursor-pointer font-bold">Raw Data (click to expand)</summary>
            <pre className="text-xs mt-4 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}