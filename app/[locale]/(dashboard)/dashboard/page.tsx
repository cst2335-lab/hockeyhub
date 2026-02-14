'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

/**
 * Dashboard summary metrics - uses React Query for consistency with games/rinks.
 */
export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const supabase = useMemo(() => createClient(), [])

  const { data: metrics, isLoading: loading, isError } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().slice(0, 10)

      const [gamesRes, bookingsRes, rinksRes] = await Promise.all([
        supabase.from('game_invitations').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('booking_date', todayStr),
        supabase.from('rinks').select('*', { count: 'exact', head: true }),
      ])

      return {
        gamesOpen: gamesRes.count ?? 0,
        bookingsUpcoming: bookingsRes.count ?? 0,
        rinksTotal: rinksRes.count ?? 0,
      }
    },
  })

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" aria-hidden />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">{t('loadError')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border dark:border-slate-700 p-6 border-l-4 border-l-gogo-primary">
          <div className="text-sm text-muted-foreground">{t('openGames')}</div>
          <div className="text-3xl font-bold text-gogo-primary mt-1">{metrics.gamesOpen}</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border dark:border-slate-700 p-6 border-l-4 border-l-gogo-secondary">
          <div className="text-sm text-muted-foreground">{t('upcomingBookings')}</div>
          <div className="text-3xl font-bold text-gogo-primary mt-1">{metrics.bookingsUpcoming}</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border dark:border-slate-700 p-6 border-l-4 border-l-gogo-dark">
          <div className="text-sm text-muted-foreground">{t('totalRinks')}</div>
          <div className="text-3xl font-bold text-gogo-primary mt-1">{metrics.rinksTotal}</div>
        </div>
      </div>
    </div>
  )
}
