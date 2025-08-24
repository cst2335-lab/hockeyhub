'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const [rink, setRink] = useState<any>(null)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [hours, setHours] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadRinkAndUser()
  }, [params.rinkId])

  const loadRinkAndUser = async () => {
    const supabase = createClient()
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
    
    // Get rink details
    const { data: rinkData } = await supabase
      .from('rinks')
      .select('*')
      .eq('id', params.rinkId)
      .single()
    
    setRink(rinkData)
  }

  const handleBooking = async () => {
    if (!date || !startTime || !hours) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    
    const subtotal = rink.hourly_rate * hours
    const platformFee = subtotal * 0.08 // 8% platform fee
    const total = subtotal + platformFee
    
    const supabase = createClient()
    
    // Create booking record
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        rink_id: params.rinkId,
        user_id: user.id,
        booking_date: date,
        start_time: startTime,
        end_time: `${parseInt(startTime) + hours}:00`,
        hours,
        subtotal,
        platform_fee: platformFee,
        total,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) {
      alert('Booking failed: ' + error.message)
      setLoading(false)
      return
    }
    
    // Redirect to payment (for now, just confirm)
    alert(`Booking created! Total: $${total.toFixed(2)}`)
    router.push('/bookings')
  }

  if (!rink) return <div className="p-8">Loading...</div>

  const subtotal = rink.hourly_rate * hours
  const fee = subtotal * 0.08
  const total = subtotal + fee

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Book Ice Time</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{rink.name}</h2>
            <p className="text-gray-600">{rink.address}</p>
            <p className="text-lg font-semibold mt-2">${rink.hourly_rate}/hour</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select time</option>
                {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(hour => (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00 {hour < 12 ? 'AM' : 'PM'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration (hours)</label>
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[1,2,3,4].map(h => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <div className="flex justify-between mb-2">
              <span>Ice Time ({hours} hour{hours > 1 ? 's' : ''})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Platform Fee (8%)</span>
              <span>${fee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleBooking}
            disabled={loading || !date || !startTime}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Confirm Booking - $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}