// app/[locale]/(dashboard)/games/page.tsx
'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Eye,
  Heart,
  Plus,
  AlertCircle,
  Search,
  Filter,
  X,
  BadgeInfo,
} from 'lucide-react';

type GameStatus = 'open' | 'matched' | 'closed' | 'cancelled';

interface Game {
  id: string;
  title: string;
  game_date: string;
  game_time: string;
  age_group: string;
  skill_level: string;
  description: string;
  status: GameStatus;
  location?: string;
  view_count?: number;
  interested_count?: number;
  created_at: string;
  isExpired?: boolean;
}

type DateFilter = 'all' | 'upcoming' | 'past';
type SortBy = 'date' | 'interest' | 'views';

export default function GamesPage() {
  const { locale } = useParams<{ locale: string }>();
  const supabase = useMemo(() => createClient(), []);

  // list + ui state
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');

  // constants
  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

  // status badge 样式统一
  const statusBadge: Record<GameStatus, string> = {
    open: 'bg-green-100 text-green-800',
    matched: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // locale-aware link helper
  const withLocale = useCallback(
    (p: string) => `/${locale || ''}${p}`.replace('//', '/'),
    [locale],
  );

  const fetchGames = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('game_invitations')
        .select('*')
        .order('game_date', { ascending: true });

      if (error) throw error;

      // 标记过期：按日期（保留近 7 天内的历史）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const processed: Game[] = (data || [])
        .filter((g) => !g.game_date || g.game_date >= sevenDaysAgoStr)
        .map((g) => ({
          ...(g as Game),
          // 统一兜底非法状态
          status: (['open', 'matched', 'closed', 'cancelled'] as GameStatus[]).includes(g.status as GameStatus)
            ? (g.status as GameStatus)
            : 'open',
          isExpired: g.game_date ? g.game_date < todayStr : false,
        }));

      setGames(processed);
    } catch (e) {
      console.error('fetchGames error:', e);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    // apply filters + sorting
    let list = [...games];

    if (dateFilter === 'upcoming') list = list.filter((g) => !g.isExpired);
    if (dateFilter === 'past') list = list.filter((g) => g.isExpired);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (g) =>
          g.title?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.location?.toLowerCase().includes(q),
      );
    }

    if (ageGroupFilter !== 'all') list = list.filter((g) => g.age_group === ageGroupFilter);
    if (skillLevelFilter !== 'all') list = list.filter((g) => g.skill_level === skillLevelFilter);

    if (locationFilter) {
      const q = locationFilter.toLowerCase();
      list = list.filter((g) => g.location?.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'interest':
          return (b.interested_count || 0) - (a.interested_count || 0);
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'date':
        default:
          if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1; // upcoming first
          return (a.game_date || '').localeCompare(b.game_date || '');
      }
    });

    setFilteredGames(list);
  }, [
    games,
    dateFilter,
    searchTerm,
    ageGroupFilter,
    skillLevelFilter,
    locationFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setAgeGroupFilter('all');
    setSkillLevelFilter('all');
    setLocationFilter('');
    setDateFilter('upcoming');
    setSortBy('date');
  };

  const hasActiveFilters = () =>
    Boolean(
      searchTerm ||
        locationFilter ||
        ageGroupFilter !== 'all' ||
        skillLevelFilter !== 'all' ||
        sortBy !== 'date',
    );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    const diffDays = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let relative = '';
    if (diffDays === 0) relative = ' (Today)';
    else if (diffDays === 1) relative = ' (Tomorrow)';
    else if (diffDays === -1) relative = ' (Yesterday)';
    else if (diffDays < -1) relative = ` (${Math.abs(diffDays)} days ago)`;
    else if (diffDays > 1 && diffDays <= 7) relative = ` (In ${diffDays} days)`;

    return (
      d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      relative
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
              {filteredGames.length} games found
              {hasActiveFilters() && ' (filtered)'}
            </p>
          </div>

          <Link
            href={withLocale('/games/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post a Game
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search games by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`px-4 py-2 border rounded-md transition flex items-center gap-2 ${
                showFilters || hasActiveFilters()
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select
                  value={ageGroupFilter}
                  onChange={(e) => setAgeGroupFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ages</option>
                  {ageGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                <select
                  value={skillLevelFilter}
                  onChange={(e) => setSkillLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  {skillLevels.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Kanata"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="interest">Most Interested</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date Tabs */}
        <div className="mb-6 flex space-x-4 border-b">
          {([
            ['all', `All Games (${games.length})`],
            ['upcoming', `Upcoming (${games.filter((g) => !g.isExpired).length})`],
            ['past', `Recent Past (${games.filter((g) => g.isExpired).length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              className={`pb-2 px-1 border-b-2 transition ${
                dateFilter === key
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => {
              const expiredBadge =
                game.isExpired ? (
                  <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full inline-flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Expired
                  </span>
                ) : null;

              return (
                <div
                  key={game.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative ${
                    game.isExpired ? 'opacity-75' : ''
                  }`}
                >
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {/* 统一状态徽章 */}
                    <span className={`text-xs px-2 py-1 rounded-full ${statusBadge[game.status]}`}>
                      {game.status}
                    </span>
                    {expiredBadge}
                  </div>

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
                        {game.game_time && <span className="ml-1">at {game.game_time}</span>}
                      </div>

                      {game.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{game.location}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {game.age_group} - {game.skill_level}
                        </span>
                      </div>
                    </div>

                    {game.description && (
                      <p className="mt-3 text-sm text-gray-500 line-clamp-2">{game.description}</p>
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
                      href={withLocale(`/games/${game.id}`)}
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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters()
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to post a game invitation!'}
            </p>
            {hasActiveFilters() ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <X className="h-5 w-5 mr-2" />
                Clear Filters
              </button>
            ) : (
              <Link
                href={withLocale('/games/new')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post First Game
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
