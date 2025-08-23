'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Simple LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myGames, setMyGames] = useState<any[]>([])
  const [joinedGames, setJoinedGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

    useEffect(() => {
    fetchUserData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
    
    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileData) {
      setProfile(profileData)
    }
    
    // Get games created by user
    const { data: myGamesData } = await supabase
      .from('game_invitations')
      .select(`
        *,
        rinks (name, address)
      `)
      .eq('created_by', user.id)
      .order('game_date', { ascending: false })
      .limit(5)
    
    if (myGamesData) {
      setMyGames(myGamesData)
    }
    
    // Get games joined by user
    const { data: joinedGamesData } = await supabase
      .from('game_invitations')
      .select(`
        *,
        rinks (name, address)
      `)
      .eq('guest_club_id', user.id)
      .order('game_date', { ascending: false })
      .limit(5)
    
    if (joinedGamesData) {
      setJoinedGames(joinedGamesData)
    }
    
    setLoading(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">🏒 HockeyHub</a>
          </div>
        </nav>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-4">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👤</span>
                </div>
                <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              
              <div className="space-y-2">
                {profile?.user_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{profile.user_type.replace('_', ' ')}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{profile.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="w-full mt-6 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Activity Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Posted Games */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">My Posted Games</h3>
                <a href="/games/new" className="text-blue-600 hover:text-blue-700 text-sm">
                  Post New →
                </a>
              </div>
              
              {myGames.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No games posted yet</p>
              ) : (
                <div className="space-y-3">
                  {myGames.map((game) => (
                    <div key={game.id} className="border-l-4 border-blue-600 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{game.title}</h4>
                          <p className="text-sm text-gray-600">
                            📅 {new Date(game.game_date).toLocaleDateString()} at {game.game_time}
                          </p>
                          <p className="text-sm text-gray-600">
                            📍 {game.rinks?.name || 'Location TBD'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          game.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {game.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {myGames.length > 0 && (
                <a href="/games" className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-4">
                  View All →
                </a>
              )}
            </div>
            
            {/* Joined Games */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Games I've Joined</h3>
                <a href="/games" className="text-blue-600 hover:text-blue-700 text-sm">
                  Browse Games →
                </a>
              </div>
              
              {joinedGames.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No games joined yet</p>
              ) : (
                <div className="space-y-3">
                  {joinedGames.map((game) => (
                    <div key={game.id} className="border-l-4 border-green-600 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{game.title}</h4>
                          <p className="text-sm text-gray-600">
                            📅 {new Date(game.game_date).toLocaleDateString()} at {game.game_time}
                          </p>
                          <p className="text-sm text-gray-600">
                            📍 {game.rinks?.name || 'Location TBD'}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Joined
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {joinedGames.length > 0 && (
                <a href="/games" className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-4">
                  View All →
                </a>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{myGames.length}</div>
                  <div className="text-sm text-gray-600">Games Posted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{joinedGames.length}</div>
                  <div className="text-sm text-gray-600">Games Joined</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}