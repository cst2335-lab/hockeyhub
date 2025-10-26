'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'                 // Added
import { useParams } from 'next/navigation'  // Added

// Simple LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

export default function ClubsPage() {
  const { locale } = useParams<{ locale: string }>() // Read locale from URL params

  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .order('name')

    if (data) setClubs(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-bold">🏒 HockeyHub</Link>
          <div className="flex gap-4">
            <Link href={`/${locale}/games`} className="text-gray-600">Games</Link>
            <Link href={`/${locale}/rinks`} className="text-gray-600">Rinks</Link>
            <Link href={`/${locale}/clubs`} className="text-blue-600">Clubs</Link>
            <Link href={`/${locale}/profile`} className="text-gray-600">Profile</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header with Register Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Ottawa Hockey Clubs</h1>
          <Link
            href={`/${locale}/clubs/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Register Your Club
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : clubs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No clubs registered yet</p>
            <Link
              href={`/${locale}/clubs/new`}
              className="text-blue-600 hover:text-blue-700"
            >
              Be the first to register your club!
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{club.name}</h2>
                  {club.verified && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Verified
                    </span>
                  )}
                </div>

                {club.description && (
                  <p className="text-gray-600 mb-3 text-sm">{club.description}</p>
                )}

                {club.contact_email && (
                  <p className="text-gray-600 text-sm mb-1">📧 {club.contact_email}</p>
                )}

                {club.contact_phone && (
                  <p className="text-gray-600 text-sm mb-1">📞 {club.contact_phone}</p>
                )}

                {club.home_rink && (
                  <p className="text-gray-600 text-sm mb-1">🏒 Home: {club.home_rink}</p>
                )}

                {club.age_groups && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {club.age_groups.split(',').map((ageGroup: string) => (
                      <span
                        key={ageGroup}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {ageGroup}
                      </span>
                    ))}
                  </div>
                )}

                {club.website && (
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
