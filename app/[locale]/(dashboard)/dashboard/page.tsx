'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBookings } from '@/lib/hooks';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDateByLocale } from '@/lib/utils/format';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Settings,
  Plus,
  Eye,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
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

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const tMyGames = useTranslations('myGames');
  const tGames = useTranslations('games');
  const tBookings = useTranslations('bookings');
  const tProfile = useTranslations('profilePage');

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';
  const withLocale = useCallback((p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/'), [locale]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      toast.success(tBookings('paymentSuccess'));
      router.replace(withLocale('/dashboard'), { scroll: false });
    }
  }, [searchParams, router, withLocale, tBookings]);

  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { bookings, isLoading: bookingsLoading, user: _ } = useBookings();

  const [isRinkManager, setIsRinkManager] = useState(false);
  const [activeTab, setActiveTab] = useState<'posted' | 'interested'>('posted');
  const [filter, setFilter] = useState<'all' | 'open' | 'matched' | 'cancelled'>('all');

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      const [profileRes, { data: manager }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', u.id).maybeSingle(),
        supabase.from('rink_managers').select('id').eq('user_id', u.id).eq('verified', true).maybeSingle(),
      ]);
      const profile = profileRes.error ? null : (profileRes.data as { role?: string } | null);
      const hasRole = profile?.role === 'rink_manager' || !!manager;
      setIsRinkManager(!!hasRole);
    })();
  }, [supabase]);

  const { data: userProfile } = useQuery({
    queryKey: ['dashboard-user-profile'],
    queryFn: async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return null;
      const { data } = await supabase.from('profiles').select('full_name').eq('id', u.id).maybeSingle();
      return { fullName: (data as { full_name?: string } | null)?.full_name ?? u.user_metadata?.full_name ?? null };
    },
  });

  const { data: metrics, isLoading: metricsLoading, isError } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);
      const [gamesRes, bookingsRes, rinksRes] = await Promise.all([
        supabase.from('game_invitations').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('booking_date', todayStr),
        supabase.from('rinks').select('*', { count: 'exact', head: true }),
      ]);
      return {
        gamesOpen: gamesRes.count ?? 0,
        bookingsUpcoming: bookingsRes.count ?? 0,
        rinksTotal: rinksRes.count ?? 0,
      };
    },
  });

  const { data: myGamesData, isLoading: myGamesLoading } = useQuery({
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

  const games = myGamesData?.games ?? [];
  const interestedGames = myGamesData?.interestedGames ?? [];
  const stats = myGamesData?.stats ?? { total: 0, open: 0, matched: 0, cancelled: 0, totalViews: 0, totalInterested: 0 };

  const filteredGames = filter === 'all' ? games : games.filter((g) => g.status === filter);

  async function updateGameStatus(gameId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('game_invitations')
        .update({ status: newStatus })
        .eq('id', gameId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['my-games'] });
      if (newStatus === 'cancelled') toast.success('Game cancelled successfully');
      else if (newStatus === 'matched') toast.success('Game marked as matched');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update game status');
    }
  }

  async function deleteGame(gameId: string) {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('game_invitations').delete().eq('id', gameId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['my-games'] });
      toast.success('Game deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete game');
    }
  }

  async function removeInterest(interestId: string) {
    if (!confirm('Remove your interest in this game?')) return;
    try {
      const { error } = await supabase.from('game_interests').delete().eq('id', interestId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['my-games'] });
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove interest');
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let rel = '';
    if (diffDays === 0) rel = ' (Today)';
    else if (diffDays === 1) rel = ' (Tomorrow)';
    else if (diffDays === -1) rel = ' (Yesterday)';
    else if (diffDays < -1) rel = ` (${Math.abs(diffDays)} days ago)`;
    else if (diffDays > 1 && diffDays <= 7) rel = ` (in ${diffDays} days)`;
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + rel;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">{tGames('statusOpen')}</span>;
      case 'matched':
        return <span className="px-2 py-1 text-xs rounded-full bg-gogo-secondary/20 text-gogo-primary">{tGames('statusMatched')}</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300">{tGames('statusCancelled')}</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300">{status}</span>;
    }
  }

  const isLoading = authLoading || metricsLoading || (!!user && myGamesLoading);

  if (isLoading && metrics === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gogo-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">{t('loadError')}</p>
      </div>
    );
  }

  const cards = [
    { href: '/games', subKey: 'cardGamesSub', titleKey: 'cardGamesTitle', descKey: 'cardGamesDesc', icon: Trophy, gradient: 'from-blue-600 to-cyan-500', lgCol: 2 },
    { href: '/rinks', subKey: 'cardRinksSub', titleKey: 'cardRinksTitle', descKey: 'cardRinksDesc', icon: MapPin, gradient: 'from-teal-600 to-cyan-600', lgCol: 2 },
    { href: '/clubs', subKey: 'cardClubsSub', titleKey: 'cardClubsTitle', descKey: 'cardClubsDesc', icon: Users, gradient: 'from-violet-600 to-indigo-600', lgCol: 2 },
  ] as const;

  const manageCard = { href: '/manage-rink', subKey: 'cardManageRinkSub', titleKey: 'cardManageRinkTitle', descKey: 'cardManageRinkDesc', icon: Settings, gradient: 'from-amber-600 to-orange-500' } as const;

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {userProfile?.fullName ? <span className="text-gogo-primary">{userProfile.fullName}</span> : null}
          {userProfile?.fullName ? ' · ' : ''}
          <span>{t('title')}</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">{t('heroDesc')}</p>

        {/* Metrics */}
        <div className="mt-8 flex flex-wrap gap-4 sm:mt-10">
          <div className="rounded-xl border border-border bg-card px-6 py-3">
            <span className="text-sm text-muted-foreground">{t('openGames')}</span>
            <span className="ml-2 text-xl font-bold text-gogo-primary">{metrics!.gamesOpen}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-6 py-3">
            <span className="text-sm text-muted-foreground">{t('upcomingBookings')}</span>
            <span className="ml-2 text-xl font-bold text-gogo-primary">{metrics!.bookingsUpcoming}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-6 py-3">
            <span className="text-sm text-muted-foreground">{t('totalRinks')}</span>
            <span className="ml-2 text-xl font-bold text-gogo-primary">{metrics!.rinksTotal}</span>
          </div>
        </div>

        {/* Season Statistics */}
        <div className="mt-10 bg-card border border-border shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{tProfile('seasonStats')}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted dark:bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-gogo-primary">0</p>
              <p className="text-sm text-muted-foreground mt-1">{tProfile('gamesPlayed')}</p>
            </div>
            <div className="bg-muted dark:bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">{tProfile('gamesOrganized')}</p>
            </div>
            <div className="bg-muted dark:bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</p>
              <p className="text-sm text-muted-foreground mt-1">{tProfile('teamsJoined')}</p>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-1">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const colClass = 'lg:col-span-2';
            const roundedClass =
              i === 0 ? 'max-lg:rounded-t-3xl lg:rounded-tl-3xl lg:rounded-bl-3xl' :
              i === 1 ? '' :
              !isRinkManager ? 'max-lg:rounded-b-3xl lg:rounded-tr-3xl lg:rounded-br-3xl' : '';

            return (
              <Link key={card.href} href={withLocale(card.href)} className={`group relative ${colClass}`}>
                <div className={`absolute inset-0 rounded-2xl bg-card ${roundedClass}`} />
                <div className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-border transition-all hover:shadow-lg ${roundedClass}`}>
                  <div className={`flex h-48 items-center justify-center bg-gradient-to-br ${card.gradient} opacity-90 transition-opacity group-hover:opacity-100`}>
                    <Icon className="h-16 w-16 text-white/90" />
                  </div>
                  <div className="p-6 pt-4">
                    <h3 className="text-sm/4 font-semibold text-gogo-primary">{t(card.subKey)}</h3>
                    <p className="mt-2 text-lg font-medium tracking-tight text-foreground">{t(card.titleKey)}</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground line-clamp-2">{t(card.descKey)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
          {isRinkManager && (
            <Link href={withLocale(manageCard.href)} className="group relative lg:col-span-6">
              <div className="absolute inset-0 rounded-2xl bg-card max-lg:rounded-b-3xl lg:rounded-b-3xl" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border transition-all hover:shadow-lg max-lg:rounded-b-3xl lg:rounded-b-3xl">
                <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${manageCard.gradient} opacity-90 transition-opacity group-hover:opacity-100`}>
                  <Settings className="h-12 w-12 text-white/90" />
                </div>
                <div className="flex flex-row items-center gap-6 p-6">
                  <div>
                    <h3 className="text-sm/4 font-semibold text-gogo-primary">{t(manageCard.subKey)}</h3>
                    <p className="mt-1 text-lg font-medium tracking-tight text-foreground">{t(manageCard.titleKey)}</p>
                    <p className="mt-1 max-w-xl text-sm/6 text-muted-foreground">{t(manageCard.descKey)}</p>
                  </div>
                  <span className="ml-auto text-sm font-medium text-gogo-primary group-hover:underline">
                    {tNav('manageRink')} →
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* My Games */}
        <section className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">{tMyGames('title')}</h2>
            <Link
              href={withLocale('/games/new')}
              className="flex items-center px-4 py-2 bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark"
            >
              <Plus className="h-5 w-5 mr-2" />
              {tMyGames('postNewGame')}
            </Link>
          </div>

          <div className="mb-6 flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('posted')}
              className={`flex-1 py-2 px-4 rounded-md transition ${activeTab === 'posted' ? 'bg-card text-gogo-primary shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tMyGames('myPostedGames')} ({games.length})
            </button>
            <button
              onClick={() => setActiveTab('interested')}
              className={`flex-1 py-2 px-4 rounded-md transition ${activeTab === 'interested' ? 'bg-card text-gogo-primary shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tMyGames('gamesInterestedIn')} ({interestedGames.length})
            </button>
          </div>

          {activeTab === 'posted' ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">{tMyGames('totalGames')}</div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.open}</div>
                  <div className="text-sm text-muted-foreground">{tMyGames('open')}</div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="text-2xl font-bold text-gogo-primary">{stats.matched}</div>
                  <div className="text-sm text-muted-foreground">{tMyGames('matched')}</div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="text-2xl font-bold text-muted-foreground">{stats.cancelled}</div>
                  <div className="text-sm text-muted-foreground">{tMyGames('cancelled')}</div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews}</div>
                  <div className="text-sm text-muted-foreground">{tMyGames('totalViews')}</div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalInterested}</div>
                  <div className="text-sm text-muted-foreground">{tMyGames('totalInterested')}</div>
                </div>
              </div>

              <div className="mb-6 flex space-x-4 border-b border-border">
                {(['all', 'open', 'matched', 'cancelled'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`pb-2 px-1 border-b-2 transition ${filter === f ? 'border-gogo-primary text-gogo-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    {tMyGames(f === 'all' ? 'all' : f)} ({f === 'all' ? games.length : stats[f]})
                  </button>
                ))}
              </div>

              {filteredGames.length > 0 ? (
                <div className="space-y-4">
                  {filteredGames.map((game) => (
                    <div key={game.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{game.title}</h3>
                              {getStatusBadge(game.status)}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="space-y-1">
                                <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{formatDate(game.game_date)} at {game.game_time || 'TBD'}</div>
                                <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{game.location || 'Location TBD'}</div>
                                <div className="flex items-center"><Users className="h-4 w-4 mr-2" />{game.age_group} - {game.skill_level}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center"><Eye className="h-4 w-4 mr-2" />{game.view_count || 0} views</div>
                                <div className="flex items-center"><Heart className="h-4 w-4 mr-2" />{game.interested_count || 0} interested</div>
                                <div className="flex items-center"><Clock className="h-4 w-4 mr-2" />Created {new Date(game.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                            {game.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{game.description}</p>}
                            {game.interested_count > 0 && game.status === 'open' && (
                              <div className="mt-3 p-2 bg-gogo-secondary/10 border border-gogo-secondary/30 rounded text-sm">
                                <AlertCircle className="inline h-4 w-4 text-gogo-primary mr-1" />
                                <span className="text-gogo-primary">
                                  {game.interested_count} team{game.interested_count > 1 ? 's are' : ' is'} interested!
                                  <Link href={withLocale('/notifications')} className="ml-2 underline font-medium">View in notifications</Link>
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex flex-col space-y-2">
                            <Link href={withLocale(`/games/${game.id}`)} className="text-gogo-primary hover:text-gogo-dark text-sm">{tMyGames('viewDetails')}</Link>
                            <Link href={withLocale(`/games/${game.id}/edit`)} className="text-purple-600 hover:text-purple-800 text-sm">{tMyGames('editGame')}</Link>
                            {game.status === 'open' && (
                              <>
                                <button onClick={() => updateGameStatus(game.id, 'matched')} className="text-green-600 hover:text-green-800 text-sm text-left">{tMyGames('markAsMatched')}</button>
                                <button onClick={() => updateGameStatus(game.id, 'cancelled')} className="text-orange-600 hover:text-orange-800 text-sm text-left">{tMyGames('cancelGame')}</button>
                              </>
                            )}
                            {game.status === 'cancelled' && (
                              <button onClick={() => updateGameStatus(game.id, 'open')} className="text-green-600 hover:text-green-800 text-sm text-left">{tMyGames('reopenGame')}</button>
                            )}
                            <button onClick={() => deleteGame(game.id)} className="text-red-600 hover:text-red-800 text-sm text-left">{tMyGames('delete')}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-xl shadow-sm">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {filter === 'all' ? tMyGames('noPostedYet') : tMyGames('noFilteredGames', { filter: tMyGames(filter) })}
                  </h3>
                  <p className="text-muted-foreground mb-6">{tMyGames('postFirstGameHint')}</p>
                  <Link href={withLocale('/games/new')} className="inline-flex items-center px-4 py-2 bg-gogo-primary text-white rounded-md hover:bg-gogo-dark">
                    <Plus className="h-5 w-5 mr-2" />
                    {tMyGames('postFirstGame')}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {interestedGames.length > 0 ? (
                interestedGames.map((interest) => (
                  <div key={interest.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{interest.game_invitations?.title}</h3>
                            {interest.game_invitations && getStatusBadge(interest.game_invitations.status)}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{formatDate(interest.game_invitations?.game_date)} at {interest.game_invitations?.game_time || 'TBD'}</div>
                              <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{interest.game_invitations?.location || 'Location TBD'}</div>
                              <div className="flex items-center"><Users className="h-4 w-4 mr-2" />{interest.game_invitations?.age_group} - {interest.game_invitations?.skill_level}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center"><Heart className="h-4 w-4 mr-2" />Interested since {new Date(interest.created_at).toLocaleDateString()}</div>
                              <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Status: {interest.status || 'pending'}</div>
                            </div>
                          </div>
                          {interest.game_invitations?.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{interest.game_invitations.description}</p>}
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          <Link href={withLocale(`/games/${interest.game_invitations?.id}`)} className="text-gogo-primary hover:text-gogo-dark text-sm">{tMyGames('viewDetails')}</Link>
                          <button onClick={() => removeInterest(interest.id)} className="text-red-600 hover:text-red-800 text-sm text-left">{tMyGames('removeInterest')}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-xl shadow-sm">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{tMyGames('noInterestedYet')}</h3>
                  <p className="text-muted-foreground mb-6">{tMyGames('browseGamesHint')}</p>
                  <Link href={withLocale('/games')} className="inline-flex items-center px-4 py-2 bg-gogo-primary text-white rounded-md hover:bg-gogo-dark">
                    {tMyGames('browseGames')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* My Bookings */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">{tBookings('title')}</h2>
          {bookingsLoading ? (
            <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-2 border-gogo-primary border-t-transparent" /></div>
          ) : bookings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
              <p className="text-muted-foreground mb-4">{tBookings('noBookings')}</p>
              <Link href={withLocale('/rinks')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gogo-primary text-white font-medium hover:bg-gogo-dark transition">
                {tBookings('browseRinksToBook')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={withLocale(`/bookings/${b.id}`)}
                  className="bg-card text-card-foreground rounded-xl shadow-md border border-border p-6 hover:shadow-lg hover:border-gogo-secondary transition-colors block"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-semibold truncate text-foreground">{b.rinks?.name ?? 'Rink'}</h3>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            b.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                            b.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                            b.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                            'bg-muted text-muted-foreground'
                          }`}
                        >
                          {b.status === 'pending' ? 'Payment pending' : b.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        📅 {formatDateByLocale(b.booking_date, locale)} — {b.start_time} ~ {b.end_time}
                      </p>
                      <p className="text-muted-foreground truncate">{b.rinks?.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm text-muted-foreground mb-1">Total</div>
                      <div className="font-bold text-foreground">{formatCurrency(b.total)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
