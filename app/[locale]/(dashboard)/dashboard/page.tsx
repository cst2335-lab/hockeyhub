'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

/**
 * Dashboard summary metrics
 * - Wrap data loader with useCallback to satisfy exhaustive-deps rule.
 */
export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    gamesOpen: 0,
    bookingsUpcoming: 0,
    rinksTotal: 0,
  })

  const loadDashboard = useCallback(async () => {
    const supabase = createClient()

    const { count: gamesOpen } = await supabase
      .from('game_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: bookingsUpcoming } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('booking_date', today.toISOString().slice(0, 10))

    const { count: rinksTotal } = await supabase
      .from('rinks')
      .select('*', { count: 'exact', head: true })

    setMetrics({
      gamesOpen: gamesOpen ?? 0,
      bookingsUpcoming: bookingsUpcoming ?? 0,
      rinksTotal: rinksTotal ?? 0,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">{t('openGames')}</div>
          <div className="text-3xl font-bold">{metrics.gamesOpen}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">{t('upcomingBookings')}</div>
          <div className="text-3xl font-bold">{metrics.bookingsUpcoming}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">{t('totalRinks')}</div>
          <div className="text-3xl font-bold">{metrics.rinksTotal}</div>
        </div>
      </div>
    </div>
  )
}
