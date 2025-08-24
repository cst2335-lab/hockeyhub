'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [existingBookings, setExistingBookings] = useState<any[]>([])

  const loadRinkAndUser = useCallback(async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
    
    const { data: rinkData } = await supabase
      .from('rinks')
      .select('*')
      .eq('id', params.rinkId)
      .single()
    
    if (!rinkData) {
      alert('Rink not found')
      router.push('/rinks')
      return
    }
    
    setRink(rinkData)
  }, [params.rinkId, router])

  // 加载当天已有的预订
  const loadExistingBookings = useCallback(async () => {
    if (!date) return
    
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('start_time, end_time, status')
      .eq('rink_id', params.rinkId)
      .eq('booking_date', date)
      .neq('status', 'cancelled')
    
    setExistingBookings(data || [])
  }, [date, params.rinkId])

  useEffect(() => {
    loadRinkAndUser()
  }, [loadRinkAndUser])

  useEffect(() => {
    loadExistingBookings()
  }, [loadExistingBookings])

  // 计算结束时间的辅助函数
  const calculateEndTime = (start: string, duration: number) => {
    const [hour, minute] = start.split(':').map(Number)
    const endHour = hour + duration
    
    // 检查是否超过营业时间（假设最晚到23:00）
    if (endHour > 23) {
      return null // 表示时间无效
    }
    
    return `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  // 检查时间冲突（更完善的逻辑）
  const checkTimeConflict = (newStart: string, newEnd: string) => {
    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }
    
    const newStartMin = parseTime(newStart)
    const newEndMin = parseTime(newEnd)
    
    return existingBookings.some(booking => {
      const existingStartMin = parseTime(booking.start_time)
      const existingEndMin = parseTime(booking.end_time)
      
      // 检查时间段是否重叠
      return (
        (newStartMin >= existingStartMin && newStartMin < existingEndMin) ||
        (newEndMin > existingStartMin && newEndMin <= existingEndMin) ||
        (newStartMin <= existingStartMin && newEndMin >= existingEndMin)
      )
    })
  }

  const handleBooking = async () => {
    if (!date || !startTime || !hours) {
      alert('Please fill all fields')
      return
    }

    const endTime = calculateEndTime(startTime, hours)
    if (!endTime) {
      alert('Selected time exceeds operating hours (closes at 11 PM)')
      return
    }

    // 检查时间冲突
    if (checkTimeConflict(startTime, endTime)) {
      alert('This time slot conflicts with an existing booking!')
      return
    }

    setLoading(true)
    
    const subtotal = rink.hourly_rate * hours
    const platformFee = parseFloat((subtotal * 0.08).toFixed(2))
    const total = parseFloat((subtotal + platformFee).toFixed(2))
    
    const supabase = createClient()
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        rink_id: params.rinkId as string,
        user_id: user.id,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        hours: hours,
        subtotal: subtotal,
        platform_fee: platformFee,
        total: total,
        status: 'pending',
        payment_status: 'unpaid'
        // 不需要手动设置 created_at，数据库会自动生成
      })
      .select()
      .single()
    
    setLoading(false)
    
    if (error) {
      console.error('Booking error:', error)
      alert('Booking failed: ' + error.message)
      return
    }
    
    // 使用 toast 或更好的通知方式
    alert(`✅ Booking created successfully!\n\nTotal: $${total.toFixed(2)}\nDate: ${date}\nTime: ${startTime} - ${endTime}`)
    
    // 清理并跳转
    router.push('/bookings')
  }

  // 获取已被预订的时间段（用于UI提示）
  const getBookedSlots = () => {
    return existingBookings.map(b => `${b.start_time} - ${b.end_time}`).join(', ')
  }

  if (!rink) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const subtotal = rink.hourly_rate * hours
  const fee = parseFloat((subtotal * 0.08).toFixed(2))
  const total = subtotal + fee

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to Rinks
        </button>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Book Ice Time</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h2 className="text-xl font-semibold">{rink.name}</h2>
            <p className="text-gray-600">{rink.address}</p>
            <p className="text-lg font-bold text-blue-600 mt-2">
              ${rink.hourly_rate}/hour
            </p>
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
              {date && existingBookings.length > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Booked slots: {getBookedSlots()}
                </p>
              )}
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
                  <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                    {hour}:00 {hour < 12 ? 'AM' : 'PM'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[1,2,3,4].map(h => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
              {startTime && calculateEndTime(startTime, hours) === null && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ End time exceeds operating hours (11 PM)
                </p>
              )}
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
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleBooking}
            disabled={loading || !date || !startTime}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : `Confirm Booking - $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}