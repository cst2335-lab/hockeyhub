'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ManageRinkPage() {
  const [myRink, setMyRink] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    hourly_rate: '',
    booking_url: '',
    amenities: '',
    peak_hours: '',
    special_notes: ''
  })

  useEffect(() => {
    fetchMyRink()
  }, [])

  const fetchMyRink = async () => {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if user is a rink manager
    const { data: managerData } = await supabase
      .from('rink_managers')
      .select('*, rinks(*)')
      .eq('user_id', user.id)
      .eq('verified', true)
      .single()

    if (managerData) {
      setMyRink(managerData.rinks)
      setFormData({
        hourly_rate: managerData.rinks.hourly_rate || '',
        booking_url: managerData.rinks.booking_url || '',
        amenities: managerData.rinks.amenities?.join(', ') || '',
        peak_hours: managerData.rinks.custom_info?.peak_hours || '',
        special_notes: managerData.rinks.custom_info?.special_notes || ''
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    
    // Update rink information
    const { error } = await supabase
      .from('rinks')
      .update({
        hourly_rate: parseFloat(formData.hourly_rate),
        booking_url: formData.booking_url,
        amenities: formData.amenities.split(',').map((a: string) => a.trim()),
        custom_info: {
          peak_hours: formData.peak_hours,
          special_notes: formData.special_notes
        },
        source: 'manager_updated'
      })
      .eq('id', myRink.id)

    if (!error) {
      alert('Rink information updated successfully!')
      
      // Log the update
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('rink_updates_log')
          .insert({
            rink_id: myRink.id,
            updated_by: user.id,
            changes: formData,
            update_type: 'manager_update'
          })
      }
    }
    
    setLoading(false)
  }

  if (!myRink) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Rink Manager Portal</h1>
          <div className="bg-yellow-50 p-4 rounded">
            <p>You are not registered as a rink manager.</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
              Apply to Manage a Rink
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manage: {myRink.name}</h1>
        
        <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-6 rounded-lg shadow border border-border">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Online Booking URL
            </label>
            <input
              type="url"
              value={formData.booking_url}
              onChange={(e) => setFormData({...formData, booking_url: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Amenities (comma separated)
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              placeholder="Skate sharpening, Pro shop, Snack bar"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Peak Hours
            </label>
            <input
              type="text"
              value={formData.peak_hours}
              onChange={(e) => setFormData({...formData, peak_hours: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              placeholder="Weekdays 6-9pm, Weekends all day"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Special Notes
            </label>
            <textarea
              value={formData.special_notes}
              onChange={(e) => setFormData({...formData, special_notes: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Any special information for users..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Update Rink Information'}
          </button>
        </form>
      </div>
    </div>
  )
}