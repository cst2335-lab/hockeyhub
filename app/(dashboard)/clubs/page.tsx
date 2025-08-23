'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name')

    if (data) {
      setClubs(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">🏒 HockeyHub</a>
          <div className="flex gap-4">
            <a href="/games" className="text-gray-600">Games</a>
            <a href="/rinks" className="text-gray-600">Rinks</a>
            <a href="/clubs" className="text-blue-600">Clubs</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Hockey Clubs</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Register Your Club
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : clubs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No clubs registered yet</p>
            <p className="text-sm text-gray-400">Be the first to register your club!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{club.name}</h3>
                  {club.verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      ✓ Verified
                    </span>
                  )}
                </div>
                
                {club.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{club.description}</p>
                )}
                
                <div className="space-y-1 text-sm text-gray-500">
                  {club.contact_email && (
                    <p>📧 {club.contact_email}</p>
                  )}
                  {club.contact_phone && (
                    <p>📞 {club.contact_phone}</p>
                  )}
                </div>
                
                <button className="mt-4 w-full border border-gray-300 py-2 rounded hover:bg-gray-50">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}