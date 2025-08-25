'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  Bell,
  TrendingUp,
  Eye,
  Heart,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalGames: number;
  activeGames: number;
  totalInterests: number;
  totalViews: number;
  unreadNotifications: number;
  upcomingBookings: number;
  myGamesCount: number;
  interestedInMyGames: number;
}

interface RecentGame {
  id: string;
  title: string;
  game_date: string;
  game_time: string;
  location: string;
  interested_count: number;
  view_count: number;
  status: string;
}

interface RecentNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  game_id: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    activeGames: 0,
    totalInterests: 0,
    totalViews: 0,
    unreadNotifications: 0,
    upcomingBookings: 0,
    myGamesCount: 0,
    interestedInMyGames: 0
  });
  
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [myRecentGames, setMyRecentGames] = useState<RecentGame[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserEmail(user.email || '');

      // Load multiple data in parallel
      await Promise.all([
        loadStats(user.id),
        loadRecentGames(),
        loadMyRecentGames(user.id),
        loadRecentNotifications(user.id)
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(userId: string) {
    try {
      // Get all games stats
      const { data: allGames } = await supabase
        .from('game_invitations')
        .select('status, view_count, interested_count');
      
      const activeGames = allGames?.filter(g => g.status === 'open').length || 0;
      const totalViews = allGames?.reduce((sum, g) => sum + (g.view_count || 0), 0) || 0;
      const totalInterests = allGames?.reduce((sum, g) => sum + (g.interested_count || 0), 0) || 0;

      // Get my games stats
      const { data: myGames } = await supabase
        .from('game_invitations')
        .select('interested_count')
        .eq('created_by', userId);
      
      const myGamesCount = myGames?.length || 0;
      const interestedInMyGames = myGames?.reduce((sum, g) => sum + (g.interested_count || 0), 0) || 0;

      // Get unread notifications
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      // Get upcoming bookings
      const today = new Date().toISOString().split('T')[0];
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('booking_date', today)
        .eq('status', 'confirmed');

      setStats({
        totalGames: allGames?.length || 0,
        activeGames,
        totalInterests,
        totalViews,
        unreadNotifications: unreadCount || 0,
        upcomingBookings: bookingsCount || 0,
        myGamesCount,
        interestedInMyGames
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function loadRecentGames() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('status', 'open')
        .gte('game_date', today)
        .order('created_at', { ascending: false })
        .limit(3);
      
      setRecentGames(data || []);
    } catch (error) {
      console.error('Error loading recent games:', error);
    }
  }

  async function loadMyRecentGames(userId: string) {
    try {
      const { data } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      setMyRecentGames(data || []);
    } catch (error) {
      console.error('Error loading my games:', error);
    }
  }

  async function loadRecentNotifications(userId: string) {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="mt-2 text-gray-600">{userEmail}</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/games/new"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <Plus className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Post Game</span>
            </Link>
            <Link
              href="/games"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <Trophy className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Find Games</span>
            </Link>
            <Link
              href="/rinks"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <MapPin className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Book Rink</span>
            </Link>
            <Link
              href="/notifications"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition relative"
            >
              <Bell className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Notifications</span>
              {stats.unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Games</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeGames}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">My Games</p>
                <p className="text-2xl font-bold text-gray-900">{stats.myGamesCount}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
            {stats.interestedInMyGames > 0 && (
              <p className="text-xs text-green-600 mt-2">
                {stats.interestedInMyGames} interested
              </p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Games Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Games */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Games</h2>
                  <Link href="/games" className="text-blue-600 hover:text-blue-800 text-sm">
                    View all →
                  </Link>
                </div>
              </div>
              <div className="divide-y">
                {recentGames.length > 0 ? (
                  recentGames.map(game => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}`}
                      className="block p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{game.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(game.game_date)}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {game.location || 'TBD'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-500">
                            <Eye className="inline h-3 w-3 mr-1" />
                            {game.view_count || 0}
                          </div>
                          <div className="text-gray-500">
                            <Heart className="inline h-3 w-3 mr-1" />
                            {game.interested_count || 0}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No upcoming games</p>
                    <Link href="/games/new" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                      Post a game →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* My Games */}
            {myRecentGames.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">My Games</h2>
                    <Link href="/my-games" className="text-blue-600 hover:text-blue-800 text-sm">
                      Manage all →
                    </Link>
                  </div>
                </div>
                <div className="divide-y">
                  {myRecentGames.map(game => (
                    <div key={game.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{game.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{formatDate(game.game_date)}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              game.status === 'open' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {game.status}
                            </span>
                          </div>
                        </div>
                        {game.interested_count > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {game.interested_count} interested
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                  {stats.unreadNotifications > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {stats.unreadNotifications} new
                    </span>
                  )}
                </div>
              </div>
              <div className="divide-y">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map(notification => (
                    <Link
                      key={notification.id}
                      href={notification.game_id ? `/games/${notification.game_id}` : '/notifications'}
                      className={`block p-4 hover:bg-gray-50 transition ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${
                          !notification.is_read ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            !notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
              {recentNotifications.length > 0 && (
                <div className="p-4 border-t">
                  <Link
                    href="/notifications"
                    className="text-center block text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all notifications →
                  </Link>
                </div>
              )}
            </div>

            {/* Platform Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="font-semibold mb-4">Platform Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Total Games</span>
                  <span className="font-bold">{stats.totalGames}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Total Views</span>
                  <span className="font-bold">{stats.totalViews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Total Interests</span>
                  <span className="font-bold">{stats.totalInterests}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}