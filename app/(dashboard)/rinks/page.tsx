'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Simple LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

export default function RinksPage() {
  const [rinks, setRinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRinks()
  }, [])

  const fetchRinks = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('rinks')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error fetching rinks:', error)
        setError(error.message)
      } else if (data) {
        setRinks(data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to load rinks')
    } finally {
      setLoading(false)
    }
  }

  // Function to open Google Maps
  const openInGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">🏒 HockeyHub</a>
          <div className="flex gap-4">
            <a href="/games" className="text-gray-600">Games</a>
            <a href="/rinks" className="text-blue-600">Rinks</a>
            <a href="/clubs" className="text-gray-600">Clubs</a>
            <a href="/profile" className="text-gray-600">Profile</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Ottawa Ice Rinks</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : rinks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No rinks available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rinks.map((rink) => (
              <div key={rink.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">{rink.name}</h2>
                <p className="text-gray-600 mb-2">📍 {rink.address}</p>
                <p className="text-gray-600 mb-2">📞 {rink.phone}</p>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Hourly Rate</p>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    ${rink.hourly_rate}/hour
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openInGoogleMaps(rink.address)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    📍 View on Map
                  </button>
                  <a 
                    href={`/games/new?rink=${rink.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}