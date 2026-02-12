'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
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

interface GameInterest {
  id: string;
  game_id: string;
  user_id: string;
  status: string;
  created_at: string;
  game_invitations: Game;
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
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname]);
  const withLocale = useCallback((p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/'), [locale]);

  const [filter, setFilter] = useState<'all' | 'open' | 'matched' | 'cancelled'>('all');
  const [activeTab, setActiveTab] = useState<'posted' | 'interested'>('posted');

  const { data, isLoading: loading } = useQuery({
    queryKey: ['my-games', user?.id],
    queryFn: async () => {
      if (!user) return { games: [], interestedGames: [], stats: { total: 0, open: 0, matched: 0, cancelled: 0, totalViews: 0, totalInterested: 0 } };
      const [gamesRes, interestsRes] = await Promise.all([
        supabase.from('game_invitations').select('*').eq('created_by', user.id).order('created_at', { ascending: false }),
        supabase.from('game_interests').select('*, game_invitations (*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (gamesRes.error) throw gamesRes.error;
      const gamesData = (gamesRes.data || []) as Game[];
      const interestedData = (interestsRes.data || []) as GameInterest[];
      const stats: Stats = {
        total: gamesData.length,
        open: gamesData.filter((g) => g.status === 'open').length,
        matched: gamesData.filter((g) => g.status === 'matched').length,
        cancelled: gamesData.filter((g) => g.status === 'cancelled').length,
        totalViews: gamesData.reduce((sum, g) => sum + (g.view_count || 0), 0),
        totalInterested: gamesData.reduce((sum, g) => sum + (g.interested_count || 0), 0),
      };
      return { games: gamesData, interestedGames: interestedData, stats };
    },
    enabled: !!user,
  });

  const games = data?.games ?? [];
  const interestedGames = data?.interestedGames ?? [];
  const stats = data?.stats ?? { total: 0, open: 0, matched: 0, cancelled: 0, totalViews: 0, totalInterested: 0 };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(withLocale('/login'));
    }
  }, [authLoading, user, router, withLocale]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" aria-hidden />
      </div>
    );
  }

  async function updateGameStatus(gameId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('game_invitations')
        .update({ status: newStatus })
        .eq('id', gameId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['my-games'] });
      
      if (newStatus === 'cancelled') {
        toast.success('Game cancelled successfully');
      } else if (newStatus === 'matched') {
        toast.success('Game marked as matched');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game status');
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

      await queryClient.invalidateQueries({ queryKey: ['my-games'] });
      toast.success('Game deleted successfully');
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  }

  async function removeInterest(interestId: string) {
    if (!confirm('Remove your interest in this game?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('game_interests')
        .delete()
        .eq('id', interestId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['my-games'] });
    } catch (error) {
      console.error('Error removing interest:', error);
      toast.error('Failed to remove interest');
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
    else if (diffDays > 1 && diffDays <= 7) relativeTime = ` (in ${diffDays} days)`;
    
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
        return <span className="px-2 py-1 text-xs rounded-full bg-gogo-secondary/20 text-gogo-primary">Matched</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  }

  const filteredGames = filter === 'all'
    ? games
    : games.filter((g) => g.status === filter);

  const isLoading = authLoading || (!!user && loading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary"></div>
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
            <p className="mt-2 text-gray-600">
              {activeTab === 'posted' ? 'Manage your posted games' : 'Games you\'re interested in'}
            </p>
          </div>
          <Link
            href={withLocale('/games/new')}
            className="flex items-center px-4 py-2 bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Game
          </Link>
        </div>

        {/* Main Tabs */}
        <div className="mb-6 flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('posted')}
            className={`flex-1 py-2 px-4 rounded-md transition ${
              activeTab === 'posted'
                ? 'bg-white text-gogo-primary shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Posted Games ({games.length})
          </button>
          <button
            onClick={() => setActiveTab('interested')}
            className={`flex-1 py-2 px-4 rounded-md transition ${
              activeTab === 'interested'
                ? 'bg-white text-gogo-primary shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Games I'm Interested In ({interestedGames.length})
          </button>
        </div>

        {activeTab === 'posted' ? (
          <>
            {/* Stats Cards - Only for posted games */}
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
                <div className="text-2xl font-bold text-gogo-primary">{stats.matched}</div>
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

            {/* Filter Tabs - Only for posted games */}
            <div className="mb-6 flex space-x-4 border-b">
              <button
                onClick={() => setFilter('all')}
                className={`pb-2 px-1 border-b-2 transition ${
                  filter === 'all' 
                    ? 'border-gogo-primary text-gogo-primary font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({games.length})
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`pb-2 px-1 border-b-2 transition ${
                  filter === 'open' 
                    ? 'border-gogo-primary text-gogo-primary font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Open ({stats.open})
              </button>
              <button
                onClick={() => setFilter('matched')}
                className={`pb-2 px-1 border-b-2 transition ${
                  filter === 'matched' 
                    ? 'border-gogo-primary text-gogo-primary font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Matched ({stats.matched})
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`pb-2 px-1 border-b-2 transition ${
                  filter === 'cancelled' 
                    ? 'border-gogo-primary text-gogo-primary font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Cancelled ({stats.cancelled})
              </button>
            </div>

            {/* Posted Games List */}
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
                            <div className="mt-3 p-2 bg-gogo-secondary/10 border border-gogo-secondary/30 rounded text-sm">
                              <AlertCircle className="inline h-4 w-4 text-gogo-primary mr-1" />
                              <span className="text-gogo-primary">
                                {game.interested_count} team{game.interested_count > 1 ? 's are' : ' is'} interested! 
                                <Link href={withLocale('/notifications')} className="ml-2 underline font-medium">
                                  View in notifications
                                </Link>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="ml-4 flex flex-col space-y-2">
                          <Link
                            href={withLocale(`/games/${game.id}`)}
                            className="text-gogo-primary hover:text-gogo-dark text-sm"
                          >
                            View Details
                          </Link>
                          
                          <Link
                            href={withLocale(`/games/${game.id}/edit`)}
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
                  href={withLocale('/games/new')}
                  className="inline-flex items-center px-4 py-2 bg-gogo-primary text-white rounded-md hover:bg-gogo-dark"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Post Your First Game
                </Link>
              </div>
            )}
          </>
        ) : (
          /* Interested Games Tab */
          <div className="space-y-4">
            {interestedGames.length > 0 ? (
              interestedGames.map((interest) => (
                <div key={interest.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {interest.game_invitations?.title}
                          </h3>
                          {getStatusBadge(interest.game_invitations?.status)}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(interest.game_invitations?.game_date)} at {interest.game_invitations?.game_time || 'TBD'}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {interest.game_invitations?.location || 'Location TBD'}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              {interest.game_invitations?.age_group} - {interest.game_invitations?.skill_level}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-2" />
                              Interested since {new Date(interest.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Status: {interest.status || 'pending'}
                            </div>
                          </div>
                        </div>

                        {interest.game_invitations?.description && (
                          <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                            {interest.game_invitations.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex flex-col space-y-2">
                        <Link
                          href={withLocale(`/games/${interest.game_invitations?.id}`)}
                          className="text-gogo-primary hover:text-gogo-dark text-sm"
                        >
                          View Details
                        </Link>
                        
                        <button
                          onClick={() => removeInterest(interest.id)}
                          className="text-red-600 hover:text-red-800 text-sm text-left"
                        >
                          Remove Interest
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No games interested yet</h3>
                <p className="text-gray-500 mb-6">Browse available games and show your interest</p>
                <Link
                  href={withLocale('/games')}
                  className="inline-flex items-center px-4 py-2 bg-gogo-primary text-white rounded-md hover:bg-gogo-dark"
                >
                  Browse Games
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}