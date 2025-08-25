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
  Plus, 
  AlertCircle,
  Search,
  Filter,
  X
} from 'lucide-react';

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
  isExpired?: boolean;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'interest' | 'views'>('date');
  
  const supabase = createClient();

  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [games, dateFilter, searchTerm, ageGroupFilter, skillLevelFilter, locationFilter, sortBy]);

  async function fetchGames() {
    try {
      const { data, error } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('status', 'open')
        .order('game_date', { ascending: true });

      if (error) throw error;

      // Process games with expiry status
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const processedGames = (data || [])
        .filter(game => {
          if (!game.game_date) return true;
          return game.game_date >= sevenDaysAgoStr;
        })
        .map(game => ({
          ...game,
          isExpired: game.game_date ? game.game_date < todayStr : false
        }));

      setGames(processedGames);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...games];

    // Date filter
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter(game => !game.isExpired);
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(game => game.isExpired);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Age group filter
    if (ageGroupFilter !== 'all') {
      filtered = filtered.filter(game => game.age_group === ageGroupFilter);
    }

    // Skill level filter
    if (skillLevelFilter !== 'all') {
      filtered = filtered.filter(game => game.skill_level === skillLevelFilter);
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(game =>
        game.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'interest':
          return (b.interested_count || 0) - (a.interested_count || 0);
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'date':
        default:
          // Upcoming games first, then by date
          if (a.isExpired !== b.isExpired) {
            return a.isExpired ? 1 : -1;
          }
          return (a.game_date || '').localeCompare(b.game_date || '');
      }
    });

    setFilteredGames(filtered);
  }

  function clearFilters() {
    setSearchTerm('');
    setAgeGroupFilter('all');
    setSkillLevelFilter('all');
    setLocationFilter('');
    setDateFilter('upcoming');
    setSortBy('date');
  }

  function hasActiveFilters() {
    return searchTerm || 
           ageGroupFilter !== 'all' || 
           skillLevelFilter !== 'all' || 
           locationFilter ||
           sortBy !== 'date';
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
    else if (diffDays > 1 && diffDays <= 7) relativeTime = ` (In ${diffDays} days)`;
    
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    }) + relativeTime;
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
            <p className="mt-2 text-gray-600">
              {filteredGames.length} games found
              {hasActiveFilters() && ' (filtered)'}
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

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search games by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
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

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Age Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group
                </label>
                <select
                  value={ageGroupFilter}
                  onChange={(e) => setAgeGroupFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ages</option>
                  {ageGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  value={skillLevelFilter}
                  onChange={(e) => setSkillLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kanata"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'interest' | 'views')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="interest">Most Interested</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>

              {/* Clear Filters */}
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

        {/* Date Filter Tabs */}
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setDateFilter('all')}
            className={`pb-2 px-1 border-b-2 transition ${
              dateFilter === 'all' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Games ({games.length})
          </button>
          <button
            onClick={() => setDateFilter('upcoming')}
            className={`pb-2 px-1 border-b-2 transition ${
              dateFilter === 'upcoming' 
                ? 'border-blue-600 text-blue-600 font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming ({games.filter(g => !g.isExpired).length})
          </button>
          <button
            onClick={() => setDateFilter('past')}
            className={`pb-2 px-1 border-b-2 transition ${
              dateFilter === 'past' 
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
              No games found
            </h3>
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
                href="/games/new"
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