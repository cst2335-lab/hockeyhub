'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy,
  Eye,
  Heart,
  Clock,
  Plus
} from 'lucide-react';

interface Game {
  id: string;
  title: string;
  game_date: string;
  game_time: string;
  rink_id: string;
  age_group: string;
  skill_level: string;
  description: string;
  status: string;
  created_by: string;
  location?: string;
  view_count?: number;
  interested_count?: number;
  created_at: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    try {
      setError(null);
      console.log('Starting to load games...');
      
      // Simple query without joins first
      const { data: gamesData, error: gamesError } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('status', 'open')
        .order('game_date', { ascending: true });

      console.log('Games query result:', { gamesData, gamesError });

      if (gamesError) {
        console.error('Database error:', gamesError);
        throw gamesError;
      }

      // Filter for upcoming games only (if game_date exists)
      const today = new Date().toISOString().split('T')[0];
      const upcomingGames = gamesData?.filter(game => {
        if (!game.game_date) return true; // Include games without dates
        return game.game_date >= today;
      }) || [];

      console.log('Filtered upcoming games:', upcomingGames.length);
      setGames(upcomingGames);
      
    } catch (error: any) {
      console.error('Error in loadGames:', error);
      setError(error.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }

  async function handleInterest(gameId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please login to show interest');
        return;
      }

      // Check if already interested
      const { data: existing } = await supabase
        .from('game_interests')
        .select('id')
        .match({ game_id: gameId, user_id: user.id })
        .single();

      if (existing) {
        // Remove interest
        await supabase
          .from('game_interests')
          .delete()
          .match({ game_id: gameId, user_id: user.id });
      } else {
        // Add interest
        await supabase
          .from('game_interests')
          .insert({
            game_id: gameId,
            user_id: user.id,
            status: 'interested'
          });
      }

      // Reload games
      loadGames();
    } catch (error) {
      console.error('Error handling interest:', error);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  }

  function getTimeAgo(dateStr: string) {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={loadGames}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Games</h1>
            <p className="mt-2 text-gray-600">
              {games.length > 0 
                ? `${games.length} games available` 
                : 'No games available'}
            </p>
          </div>
          <Link
            href="/games/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post a Game
          </Link>
        </div>

        {/* Games Grid */}
        {games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {game.title || 'Untitled Game'}
                    </h3>
                    <button
                      onClick={() => handleInterest(game.id)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition ml-2"
                    >
                      <Heart className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Game Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(game.game_date)} at {game.game_time || 'TBD'}</span>
                    </div>
                    
                    {game.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{game.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{game.age_group || 'All ages'} - {game.skill_level || 'All levels'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {game.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                      {game.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {game.view_count || 0} views
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {game.interested_count || 0} interested
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(game.created_at)}
                    </span>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-4">
                    <Link
                      href={`/games/${game.id}`}
                      className="block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games available</h3>
            <p className="text-gray-500 mb-6">Be the first to post a game invitation!</p>
            <Link
              href="/games/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post First Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}