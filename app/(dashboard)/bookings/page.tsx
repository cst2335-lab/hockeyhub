'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
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

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rinks (
          name,
          address,
          hourly_rate
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookings(data)
    }
    setLoading(false)
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (!error) {
      alert('Booking cancelled successfully')
      fetchBookings()
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filterBookings = (type: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch(type) {
      case 'upcoming':
        return bookings.filter(b => 
          new Date(b.booking_date) >= today && 
          b.status !== 'cancelled'
        )
      case 'past':
        return bookings.filter(b => 
          new Date(b.booking_date) < today ||
          b.status === 'completed'
        )
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled')
      default:
        return bookings
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredBookings = filterBookings(activeTab)

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your ice rink reservations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            ${bookings
              .filter(b => b.status !== 'cancelled')
              .reduce((sum, b) => sum + parseFloat(b.total || 0), 0)
              .toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {bookings
              .filter(b => b.status !== 'cancelled')
              .reduce((sum, b) => sum + (b.hours || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Hours Booked</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {['upcoming', 'past', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} ({filterBookings(tab).length})
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="p-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No {activeTab} bookings</p>
              <button
                onClick={() => router.push('/rinks')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Book a Rink
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          {booking.rinks?.name || 'Unknown Rink'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p>📅 <strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                          <p>⏰ <strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
                          <p>⏱️ <strong>Duration:</strong> {booking.hours} hours</p>
                        </div>
                        <div>
                          <p>📍 <strong>Location:</strong> {booking.rinks?.address}</p>
                          <p>💰 <strong>Total:</strong> ${booking.total}</p>
                          <p>🎫 <strong>Booking ID:</strong> {booking.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 space-y-2">
                      <button
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                        className="block w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {booking.status !== 'cancelled' && new Date(booking.booking_date) > new Date() && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="block w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}