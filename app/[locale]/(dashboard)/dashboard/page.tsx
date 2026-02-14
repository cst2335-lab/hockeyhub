'use client';

import { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Trophy, Calendar, FileText, MapPin, Users, Settings } from 'lucide-react';

/**
 * Dashboard bento layout - reference Tailwind bento example
 */
export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');
  const supabase = useMemo(() => createClient(), []);

  const [isRinkManager, setIsRinkManager] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [profileRes, { data: manager }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
        supabase.from('rink_managers').select('id').eq('user_id', user.id).eq('verified', true).maybeSingle(),
      ]);
      const profile = profileRes.error ? null : profileRes.data;
      const hasRole = (profile as { role?: string } | null)?.role === 'rink_manager' || !!manager;
      setIsRinkManager(!!hasRole);
    })();
  }, [supabase]);

  const { data: metrics, isLoading: loading, isError } = useQuery({
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

  if (loading || metrics === undefined) {
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
    { href: '/games', subKey: 'cardGamesSub', titleKey: 'cardGamesTitle', descKey: 'cardGamesDesc', icon: Trophy, gradient: 'from-blue-600 to-cyan-500', lgCol: 3 },
    { href: '/bookings', subKey: 'cardBookingsSub', titleKey: 'cardBookingsTitle', descKey: 'cardBookingsDesc', icon: Calendar, gradient: 'from-sky-600 to-blue-600', lgCol: 3 },
    { href: '/my-games', subKey: 'cardMyGamesSub', titleKey: 'cardMyGamesTitle', descKey: 'cardMyGamesDesc', icon: FileText, gradient: 'from-indigo-600 to-blue-600', lgCol: 2 },
    { href: '/rinks', subKey: 'cardRinksSub', titleKey: 'cardRinksTitle', descKey: 'cardRinksDesc', icon: MapPin, gradient: 'from-teal-600 to-cyan-600', lgCol: 2 },
    { href: '/clubs', subKey: 'cardClubsSub', titleKey: 'cardClubsTitle', descKey: 'cardClubsDesc', icon: Users, gradient: 'from-violet-600 to-indigo-600', lgCol: 2 },
  ] as const;

  const manageCard = { href: '/manage-rink', subKey: 'cardManageRinkSub', titleKey: 'cardManageRinkTitle', descKey: 'cardManageRinkDesc', icon: Settings, gradient: 'from-amber-600 to-orange-500' } as const;

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base/7 font-semibold text-gogo-primary">{t('heroSubtitle')}</h2>
        <p className="mt-2 max-w-lg text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
          {t('heroTitle')}
        </p>
        <p className="mt-4 max-w-xl text-muted-foreground">{t('heroDesc')}</p>

        {/* Metrics summary */}
        <div className="mt-8 flex flex-wrap gap-4 sm:mt-10">
          <div className="rounded-xl border border-border bg-card px-6 py-3">
            <span className="text-sm text-muted-foreground">{t('openGames')}</span>
            <span className="ml-2 text-xl font-bold text-gogo-primary">{metrics.gamesOpen}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-6 py-3">
            <span className="text-sm text-muted-foreground">{t('upcomingBookings')}</span>
            <span className="ml-2 text-xl font-bold text-gogo-primary">{metrics.bookingsUpcoming}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-6 py-3">
            <span className="text-sm text-muted-foreground">{t('totalRinks')}</span>
            <span className="ml-2 text-xl font-bold text-gogo-primary">{metrics.rinksTotal}</span>
          </div>
        </div>

        {/* Bento grid - ref Tailwind bento example */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const colClass = card.lgCol === 3 ? 'lg:col-span-3' : 'lg:col-span-2';
            const roundedClass =
              i === 0
                ? 'max-lg:rounded-t-3xl lg:rounded-tl-3xl'
                : i === 1
                  ? 'lg:rounded-tr-3xl'
                  : i === 2
                    ? 'lg:rounded-bl-3xl'
                    : i === 4 && !isRinkManager
                      ? 'max-lg:rounded-b-3xl lg:rounded-br-3xl'
                      : '';

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
      </div>
    </div>
  );
}
