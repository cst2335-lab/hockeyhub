'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/LoadingSpinner'

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

  // Generate Google Maps URL
  const getMapUrl = (address: string, city: string) => {
    const fullAddress = `${address}, ${city}, ON, Canada`
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Ottawa Ice Rinks ({rinks.length})</h1>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded">
            Error: {error}
          </div>
        ) : rinks.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded text-center">
            <p className="text-gray-600">No rinks found in the database</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {rinks.map((rink) => (
              <div key={rink.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{rink.name}</h3>
                  
                  <div className="space-y-2 text-gray-600">
                    <p className="flex items-start">
                      <span className="mr-2">📍</span>
                      <span>{rink.address}, {rink.city}</span>
                    </p>
                    
                    {rink.phone && (
                      <p className="flex items-center">
                        <span className="mr-2">📞</span>
                        <a href={`tel:${rink.phone}`} className="text-blue-600 hover:underline">
                          {rink.phone}
                        </a>
                      </p>
                    )}
                    
                    <p className="flex items-center">
                      <span className="mr-2">💰</span>
                      <span className="font-semibold">${rink.hourly_rate}/hour</span>
                    </p>
                    
                    <p className="flex items-center">
                      <span className="mr-2">🕐</span>
                      <span>{rink.availability_hours}</span>
                    </p>

                    {/* Map Link */}
                    <p className="flex items-center">
                      <span className="mr-2">🗺️</span>
                      <a 
                        href={getMapUrl(rink.address, rink.city)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View on Google Maps
                      </a>
                    </p>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => window.location.href = `/games/new?rinkId=${rink.id}&rinkName=${encodeURIComponent(rink.name)}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={() => window.open(getMapUrl(rink.address, rink.city), '_blank')}
                      className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      📍 Map
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}