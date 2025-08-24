'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          rinks (name, address)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
      
      setBookings(data || [])
    }
    setLoading(false)
  }

  if (loading) return <div className="p-8">Loading bookings...</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings yet</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{booking.rinks?.name}</h3>
                  <p className="text-gray-600">{booking.rinks?.address}</p>
                  <p className="mt-2">
                    📅 {booking.booking_date} at {booking.start_time}
                  </p>
                  <p>Duration: {booking.hours} hours</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${booking.total}</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}