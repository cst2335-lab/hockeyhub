'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function BookRinkPage() {
  const router = useRouter()
  // Read locale and rinkId from URL params (client-side)
  const { locale, rinkId } = useParams<{ locale: string; rinkId: string }>()
  
  const [rink, setRink] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form fields
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [hours, setHours] = useState(1)

  useEffect(() => {
    fetchRink()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rinkId])

  const fetchRink = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('rinks')
      .select('*')
      .eq('id', rinkId)
      .single()
    
    if (data) {
      setRink(data)
    } else if (error) {
      console.error('Error fetching rink:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Localized redirect to login
      router.push(`/${locale}/login`)
      setSubmitting(false)
      return
    }

    const hourlyRate = rink?.hourly_rate || 150
    const subtotal = hourlyRate * hours
    const platformFee = subtotal * 0.08
    const total = subtotal + platformFee
    const endHour = parseInt(startTime.split(':')[0]) + hours

    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        rink_id: rinkId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: `${endHour}:00`,
        hours: hours,
        subtotal: subtotal,
        platform_fee: platformFee.toFixed(2),
        total: total.toFixed(2),
        status: 'pending'
      })

    if (!error) {
      alert('Booking created successfully! Redirecting to your bookings...')
      // Localized redirect to bookings
      router.push(`/${locale}/bookings`)
    } else {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!rink) {
    return (
      <div className="container mx-auto p-8">
        <p>Rink not found</p>
      </div>
    )
  }

  const hourlyRate = rink.hourly_rate || 150
  const subtotal = hourlyRate * hours
  const platformFee = subtotal * 0.08
  const total = subtotal + platformFee

  // Today's date for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Book {rink.name}</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Rink Details</h2>
        <p className="text-gray-600">{rink.address}</p>
        {rink.phone && <p className="text-gray-600">{rink.phone}</p>}
        <p className="text-lg font-medium mt-2">${hourlyRate}/hour</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              min={today}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <select
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select time</option>
              {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(hour => (
                <option key={hour} value={`${hour}:00`}>
                  {hour}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {[1,2,3,4].map(h => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Price Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Ice Time ({hours} hours × ${hourlyRate})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (8%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  )
}
