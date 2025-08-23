'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myGames, setMyGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) setProfile(profileData)

      // Load my games
      const { data: gamesData } = await supabase
        .from('game_invitations')
        .select('*, rinks(name)')
        .eq('created_by', user.id)
        .order('game_date', { ascending: false })
      
      if (gamesData) setMyGames(gamesData)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div className="p-8">Loading...</div>

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please login to view your profile</p>
          <a href="/login" className="text-blue-600 hover:text-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">🏒 HockeyHub</a>
          <div className="flex gap-4">
            <a href="/games" className="text-gray-600">Games</a>
            <a href="/rinks" className="text-gray-600">Rinks</a>
            <a href="/clubs" className="text-gray-600">Clubs</a>
            <a href="/profile" className="text-blue-600">Profile</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {profile?.full_name || 'Not set'}</p>
            <p><strong>User Type:</strong> {profile?.user_type || 'Not set'}</p>
            <p><strong>Phone:</strong> {profile?.phone || 'Not set'}</p>
            <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Posted Games ({myGames.length})</h2>
          {myGames.length === 0 ? (
            <p className="text-gray-500">You haven't posted any games yet</p>
          ) : (
            <div className="space-y-3">
              {myGames.map((game) => (
                <div key={game.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold">{game.title}</h3>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(game.game_date).toLocaleDateString()} at {game.game_time}
                  </p>
                  <p className="text-sm text-gray-600">
                    📍 {game.rinks?.name || 'Location TBD'}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                    game.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {game.status}
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