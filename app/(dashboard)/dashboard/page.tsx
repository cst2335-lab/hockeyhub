'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
    favoriteRink: '',
    nextBooking: null as any
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    // Fetch bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        rinks (name, address)
      `)
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false })

    if (bookings) {
      // Calculate stats
      const today = new Date()
      const upcoming = bookings.filter(b => 
        new Date(b.booking_date) >= today && 
        b.status !== 'cancelled'
      )
      
      const totalSpent = bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + parseFloat(b.total || 0), 0)

      // Find favorite rink (most booked)
      const rinkCounts: Record<string, number> = {}
      bookings.forEach(b => {
        if (b.rinks?.name) {
          rinkCounts[b.rinks.name] = (rinkCounts[b.rinks.name] || 0) + 1
        }
      })
      const favoriteRink = Object.entries(rinkCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None yet'

      setStats({
        totalBookings: bookings.filter(b => b.status !== 'cancelled').length,
        upcomingBookings: upcoming.length,
        totalSpent,
        favoriteRink,
        nextBooking: upcoming[0] || null
      })

      setRecentBookings(bookings.slice(0, 5))
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">{user?.email}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => router.push('/rinks')}
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-2xl mb-2 block">🏒</span>
          <span className="font-medium">Book a Rink</span>
        </button>
        <button
          onClick={() => router.push('/bookings')}
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <span className="text-2xl mb-2 block">📅</span>
          <span className="font-medium">My Bookings</span>
        </button>
        <button
          onClick={() => router.push('/games')}
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <span className="text-2xl mb-2 block">🎮</span>
          <span className="font-medium">Find Games</span>
        </button>
        <button
          onClick={() => router.push('/clubs')}
          className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <span className="text-2xl mb-2 block">👥</span>
          <span className="font-medium">Clubs</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Total Bookings</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalBookings}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Upcoming</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.upcomingBookings}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Total Spent</div>
          <div className="text-3xl font-bold text-purple-600">
            ${stats.totalSpent.toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Favorite Rink</div>
          <div className="text-lg font-bold text-orange-600">
            {stats.favoriteRink}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Booking */}
        {stats.nextBooking && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Next Booking</h2>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg">
                {stats.nextBooking.rinks?.name}
              </h3>
              <p className="text-gray-600 mt-2">
                📅 {new Date(stats.nextBooking.booking_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                ⏰ {stats.nextBooking.start_time} - {stats.nextBooking.end_time}
              </p>
              <p className="text-gray-600">
                📍 {stats.nextBooking.rinks?.address}
              </p>
              <button
                onClick={() => router.push(`/bookings/${stats.nextBooking.id}`)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details →
              </button>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <button
              onClick={() => router.push('/bookings')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View all →
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{booking.rinks?.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}