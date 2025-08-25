'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Calendar, MapPin, Users, Trophy, Eye, Heart, Clock, Plus } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  game_date: string;
  game_time: string;
  age_group: string;
  skill_level: string;
  description: string;
  status: string;
  location?: string;
  view_count?: number;
  interested_count?: number;
  created_at: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const { data, error } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('status', 'open')
        .order('game_date', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Games</h1>
            <p className="mt-2 text-gray-600">{games.length} games available</p>
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
              <div key={game.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {game.title || 'Untitled Game'}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(game.game_date)} at {game.game_time || 'TBD'}</span>
                    </div>
                    
                    {game.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{game.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{game.age_group} - {game.skill_level}</span>
                    </div>
                  </div>

                  {game.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                      {game.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {game.view_count || 0} views
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {game.interested_count || 0} interested
                    </span>
                  </div>

                  <Link
                    href={`/games/${game.id}`}
                    className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games available</h3>
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