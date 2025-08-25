'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Eye, 
  Heart, 
  Edit, 
  X,
  Plus,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2
} from 'lucide-react';

interface Game {
  id: string;
  title: string;
  game_date: string;
  game_time: string;
  location: string;
  age_group: string;
  skill_level: string;
  description: string;
  status: string;
  view_count: number;
  interested_count: number;
  created_at: string;
}

interface Stats {
  total: number;
  open: number;
  matched: number;
  cancelled: number;
  totalViews: number;
  totalInterested: number;
}

export default function MyGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    matched: 0,
    cancelled: 0,
    totalViews: 0,
    totalInterested: 0
  });
  const [filter, setFilter] = useState<'all' | 'open' | 'matched' | 'cancelled'>('all');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadMyGames();
  }, []);

  async function loadMyGames() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const gamesData = data || [];
      setGames(gamesData);

      // Calculate stats
      const statsData = {
        total: gamesData.length,
        open: gamesData.filter(g => g.status === 'open').length,
        matched: gamesData.filter(g => g.status === 'matched').length,
        cancelled: gamesData.filter(g => g.status === 'cancelled').length,
        totalViews: gamesData.reduce((sum, g) => sum + (g.view_count || 0), 0),
        totalInterested: gamesData.reduce((sum, g) => sum + (g.interested_count || 0), 0)
      };
      setStats(statsData);

    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateGameStatus(gameId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('game_invitations')
        .update({ status: newStatus })
        .eq('id', gameId);

      if (error) throw error;

      // Reload games
      loadMyGames();
      
      // Show success message
      if (newStatus === 'cancelled') {
        alert('Game cancelled successfully');
      } else if (newStatus === 'matched') {
        alert('Game marked as matched');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Failed to update game status');
    }
  }

  async function deleteGame(gameId: string) {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('game_invitations')
        .delete()
        .eq('id', gameId);

      if (error) throw error;

      // Reload games
      loadMyGames();
      alert('Game deleted successfully');
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game');
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let relativeTime = '';
    if (diffDays === 0) relativeTime = ' (Today)';
    else if (diffDays === 1) relativeTime = ' (Tomorrow)';
    else if (diffDays === -1) relativeTime = ' (Yesterday)';
    else if (diffDays < -1) relativeTime = ` (${Math.abs(diffDays)} days ago)`;
    
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    }) + relativeTime;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Open</span>;
      case 'matched':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Matched</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  }

  const filteredGames = filter === 'all' 
    ? games 
    : games.filter(g => g.status === filter);

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
            <h1 className="text-3xl font-bold text-gray-900">My Games</h1>
            <p className="mt-2 text-gray-600">Manage your posted games</p>
          </div>
          <Link
            href="/games/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Game
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Games</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.open}</div>
            <div className="text-sm text-gray-500">Open</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.matched}</div>
            <div className="text-sm text-gray-500">Matched</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-500">Cancelled</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.totalInterested}</div>
            <div className="text-sm text-gray-500">Total Interested</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`pb-2 px-1 border-b-2 transition ${
              filter === 'all' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({games.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`pb-2 px-1 border-b-2 transition ${
              filter === 'open' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Open ({stats.open})
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`pb-2 px-1 border-b-2 transition ${
              filter === 'matched' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Matched ({stats.matched})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`pb-2 px-1 border-b-2 transition ${
              filter === 'cancelled' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>

        {/* Games List */}
        {filteredGames.length > 0 ? (
          <div className="space-y-4">
            {filteredGames.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {game.title}
                        </h3>
                        {getStatusBadge(game.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(game.game_date)} at {game.game_time || 'TBD'}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {game.location || 'Location TBD'}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {game.age_group} - {game.skill_level}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            {game.view_count || 0} views
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-2" />
                            {game.interested_count || 0} interested
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Created {new Date(game.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {game.description && (
                        <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                          {game.description}
                        </p>
                      )}

                      {/* Interest Alert */}
                      {game.interested_count > 0 && game.status === 'open' && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <AlertCircle className="inline h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-blue-800">
                            {game.interested_count} team{game.interested_count > 1 ? 's are' : ' is'} interested! 
                            <Link href="/notifications" className="ml-2 underline font-medium">
                              View in notifications
                            </Link>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link
                        href={`/games/${game.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </Link>
                      
                      <Link
                        href={`/games/${game.id}/edit`}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                      >
                        Edit Game
                      </Link>
                      
                      {game.status === 'open' && (
                        <>
                          <button
                            onClick={() => updateGameStatus(game.id, 'matched')}
                            className="text-green-600 hover:text-green-800 text-sm text-left"
                          >
                            Mark as Matched
                          </button>
                          <button
                            onClick={() => updateGameStatus(game.id, 'cancelled')}
                            className="text-orange-600 hover:text-orange-800 text-sm text-left"
                          >
                            Cancel Game
                          </button>
                        </>
                      )}
                      
                      {game.status === 'cancelled' && (
                        <button
                          onClick={() => updateGameStatus(game.id, 'open')}
                          className="text-green-600 hover:text-green-800 text-sm text-left"
                        >
                          Reopen Game
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteGame(game.id)}
                        className="text-red-600 hover:text-red-800 text-sm text-left"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No games posted yet' : `No ${filter} games`}
            </h3>
            <p className="text-gray-500 mb-6">Start by posting your first game invitation</p>
            <Link
              href="/games/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post Your First Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}