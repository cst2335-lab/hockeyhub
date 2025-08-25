'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Calendar, MapPin, Users, Trophy, Eye, Heart, Clock, Plus, AlertCircle } from 'lucide-react';

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
  isExpired?: boolean;  // 添加过期标识
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
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

      // 处理游戏数据，标记过期状态
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // 计算7天前的日期（只显示最近7天的过期游戏）
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const processedGames = (data || [])
        .filter(game => {
          // 如果没有日期，显示
          if (!game.game_date) return true;
          // 显示7天内的所有游戏（包括过期的）
          return game.game_date >= sevenDaysAgoStr;
        })
        .map(game => ({
          ...game,
          isExpired: game.game_date ? game.game_date < todayStr : false
        }))
        .sort((a, b) => {
          // 未过期的在前，过期的在后
          if (a.isExpired !== b.isExpired) {
            return a.isExpired ? 1 : -1;
          }
          // 同类型按日期排序
          return (a.game_date || '').localeCompare(b.game_date || '');
        });

      setGames(processedGames);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 添加相对时间提示
    let relativeTime = '';
    if (diffDays === 0) relativeTime = ' (Today)';
    else if (diffDays === 1) relativeTime = ' (Tomorrow)';
    else if (diffDays === -1) relativeTime = ' (Yesterday)';
    else if (diffDays < -1) relativeTime = ` (${Math.abs(diffDays)} days ago)`;
    else if (diffDays > 1 && diffDays <= 7) relativeTime = ` (In ${diffDays} days)`;
    
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    }) + relativeTime;
  }

  // 根据筛选条件过滤游戏
  const filteredGames = games.filter(game => {
    if (filter === 'upcoming') return !game.isExpired;
    if (filter === 'past') return game.isExpired;
    return true; // 'all'
  });

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
            <p className="mt-2 text-gray-600">
              {filteredGames.length} {filter !== 'all' && filter} games available
              {games.some(g => g.isExpired) && filter === 'all' && 
                ` (${games.filter(g => !g.isExpired).length} upcoming, ${games.filter(g => g.isExpired).length} past)`
              }
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
            All Games ({games.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`pb-2 px-1 border-b-2 transition ${
              filter === 'upcoming' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming ({games.filter(g => !g.isExpired).length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`pb-2 px-1 border-b-2 transition ${
              filter === 'past' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Recent Past ({games.filter(g => g.isExpired).length})
          </button>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div 
                key={game.id} 
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative ${
                  game.isExpired ? 'opacity-75' : ''
                }`}
              >
                {/* Expired Badge */}
                {game.isExpired && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Expired
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-16">
                    {game.title || 'Untitled Game'}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className={game.isExpired ? 'line-through' : ''}>
                        {formatDate(game.game_date)}
                      </span>
                      {game.game_time && (
                        <span className="ml-1">at {game.game_time}</span>
                      )}
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
                    className={`mt-4 block text-center px-4 py-2 rounded-md transition ${
                      game.isExpired 
                        ? 'bg-gray-400 text-white hover:bg-gray-500' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {game.isExpired ? 'View Details (Expired)' : 'View Details'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'past' ? 'No recent past games' : 'No games available'}
            </h3>
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