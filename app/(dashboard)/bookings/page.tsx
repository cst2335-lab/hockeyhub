'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        rinks (name, address)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setBookings(data || [])
    setLoading(false)
  }

  if (loading) return <div className="p-8">Loading bookings...</div>

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No bookings yet</p>
          <Link href="/rinks" className="text-blue-600 hover:text-blue-700">
            Book your first ice time →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => (
            <Link 
              key={booking.id} 
              href={`/bookings/${booking.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{booking.rinks?.name}</h2>
                  <p className="text-gray-600">{new Date(booking.booking_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{booking.start_time} - {booking.end_time}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded text-sm ${statusColors[booking.status] || 'bg-gray-100'}`}>
                    {booking.status}
                  </span>
                  <p className="mt-2 font-bold">${booking.total}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}