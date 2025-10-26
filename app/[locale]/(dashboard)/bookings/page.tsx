'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'

/**
 * Bookings list page
 * - Localize routes with locale from useParams()
 * - Guard with auth; redirect to /{locale}/login when not signed in
 * - Keep data loader wrapped in useCallback
 */
export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Read locale from URL for localized navigations/links
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()

  const fetchBookings = useCallback(async () => {
    const supabase = createClient()

    // Require auth and redirect to localized login when not signed in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/${locale}/login`)
      return
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rinks (name, address)
      `)
      .eq('user_id', user.id)
      .order('booking_date', { ascending: true })

    if (error) {
      console.error('Failed to load bookings:', error)
      setBookings([])
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }, [locale, router])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No bookings yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/${locale}/bookings/${b.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{b.rinks?.name ?? 'Rink'}</h3>
                  <p className="text-gray-600 mt-1">
                    📅 {formatDate(b.booking_date)} — {b.start_time} ~ {b.end_time}
                  </p>
                  <p className="text-gray-600">{b.rinks?.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Total</div>
                  <div className="font-bold">{formatCurrency(b.total)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
