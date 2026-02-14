// app/[locale]/(dashboard)/games/page.tsx
'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {createClient} from '@/lib/supabase/client';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
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

const PAGE_SIZE = 20;

export default function GamesPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('games');
  const supabase = useMemo(() => createClient(), []);

  // Fetch games with React Query
  const { data: gamesData, isLoading: loading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_invitations')
        .select('*')
        .order('game_date', { ascending: true });
      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      return (data || [])
        .filter((g: { game_date?: string }) => !g.game_date || g.game_date >= sevenDaysAgoStr)
        .map((g) => {
          const row = g as unknown as Game;
          return {
            ...row,
            status: (['open', 'matched', 'closed', 'cancelled'] as GameStatus[]).includes(row.status)
              ? row.status
              : 'open',
            isExpired: row.game_date ? row.game_date < todayStr : false,
          } as Game;
        });
    },
  });

  const games = gamesData ?? [];
  const prevFiltersRef = useRef<string>('');

  // UI state
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [currentPage, setCurrentPage] = useState(1);

  // constants
  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

  // status badge 样式统一
  const statusBadge: Record<GameStatus, string> = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    matched: 'bg-gogo-secondary/20 text-gogo-primary',
    closed: 'bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };

  // locale-aware link helper
  const withLocale = useCallback(
    (p: string) => `/${locale || ''}${p}`.replace('//', '/'),
    [locale],
  );

  const filterKey = `${dateFilter}-${searchTerm}-${ageGroupFilter}-${skillLevelFilter}-${locationFilter}-${sortBy}`;
  const filteredGames = useMemo(() => {
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
          if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;
          return (a.game_date || '').localeCompare(b.game_date || '');
      }
    });

    return list;
  }, [games, dateFilter, searchTerm, ageGroupFilter, skillLevelFilter, locationFilter, sortBy]);

  useEffect(() => {
    if (prevFiltersRef.current !== filterKey) {
      prevFiltersRef.current = filterKey;
      setCurrentPage(1);
    }
  }, [filterKey]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('gamesFound', { count: filteredGames.length })}
              {hasActiveFilters() && ` ${t('filtered')}`}
            </p>
          </div>

          <Link
            href={withLocale('/games/new')}
            className="flex items-center px-4 py-2 bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post a Game
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 bg-card border border-border dark:border-slate-700 rounded-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary"
              />
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`px-4 py-2 border rounded-lg transition flex items-center gap-2 ${
                showFilters || hasActiveFilters()
                  ? 'bg-gogo-primary/10 border-gogo-primary text-gogo-primary'
                  : 'border-input bg-background text-foreground hover:bg-muted'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <span className="bg-gogo-primary text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('ageGroup')}</label>
                <select
                  value={ageGroupFilter}
                  onChange={(e) => setAgeGroupFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary"
                >
                  <option value="all">{t('dateFilterAll')}</option>
                  {ageGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('skillLevel')}</label>
                <select
                  value={skillLevelFilter}
                  onChange={(e) => setSkillLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary"
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
                <label className="block text-sm font-medium text-foreground mb-1">{t('location')}</label>
                <input
                  type="text"
                  placeholder="e.g., Kanata"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary"
                >
                  <option value="date">{t('sortByDate')}</option>
                  <option value="interest">{t('sortByInterest')}</option>
                  <option value="views">{t('sortByViews')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('clearFilters')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date Tabs */}
        <div className="mb-6 flex space-x-4 border-b border-border">
          {([
            ['all', `${t('dateFilterAll')} (${games.length})`],
            ['upcoming', `${t('dateFilterUpcoming')} (${games.filter((g) => !g.isExpired).length})`],
            ['past', `${t('dateFilterPast')} (${games.filter((g) => g.isExpired).length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              className={`pb-2 px-1 border-b-2 transition ${
                dateFilter === key
                  ? 'border-gogo-primary text-gogo-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredGames.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGames.map((game) => {
              const expiredBadge =
                game.isExpired ? (
                  <span className="bg-muted-foreground/80 dark:bg-slate-600 text-white text-xs px-2 py-1 rounded-full inline-flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Expired
                  </span>
                ) : null;

              return (
                <div
                  key={game.id}
                  className={`bg-card text-card-foreground rounded-xl shadow-md border border-border dark:border-slate-700 hover:shadow-lg transition-shadow relative ${
                    game.isExpired ? 'opacity-75' : ''
                  }`}
                >
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusBadge[game.status]}`}>
                      {game.status}
                    </span>
                    {expiredBadge}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 pr-16">
                      {game.title || 'Untitled Game'}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
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
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{game.description}</p>
                    )}

                    <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
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
                          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                          : 'bg-gogo-primary text-white hover:bg-gogo-dark'
                      }`}
                    >
                      {game.isExpired ? 'View Details (Expired)' : 'View Details'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGames.length > PAGE_SIZE && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-md border border-input bg-background text-foreground hover:bg-gogo-secondary/10 hover:border-gogo-primary hover:text-gogo-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t('prevPage')}
              </button>
              <span className="text-sm text-muted-foreground">
                {t('pageOf', { current: currentPage, total: totalPages })}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 rounded-md border border-input bg-background text-foreground hover:bg-gogo-secondary/10 hover:border-gogo-primary hover:text-gogo-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t('nextPage')}
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-xl shadow-sm">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('noGames')}</h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters()
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to post a game invitation!'}
            </p>
            {hasActiveFilters() ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-muted transition"
              >
                <X className="h-5 w-5 mr-2" />
                Clear Filters
              </button>
            ) : (
              <Link
                href={withLocale('/games/new')}
                className="inline-flex items-center px-4 py-2 bg-gogo-primary text-white rounded-md hover:bg-gogo-dark"
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
