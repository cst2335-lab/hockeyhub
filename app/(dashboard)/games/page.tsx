'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Simple LoadingSpinner component (if you haven't created it separately)
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Filter states
  const [filterAge, setFilterAge] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')

  useEffect(() => {
    fetchGames()
    getUser()
  }, [])

  const getUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchGames = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('game_invitations')
      .select(`
        *,
        rinks (name, address)
      `)
      .order('game_date', { ascending: true })
    
    if (data) {
      setGames(data)
    }
    setLoading(false)
  }

  const handleRespond = async (gameId: string) => {
    if (!user) {
      alert('Please login to respond to games')
      return
    }
    
    const supabase = createClient()
    const { error } = await supabase
      .from('game_invitations')
      .update({
        status: 'matched',
        guest_club_id: user.id
      })
      .eq('id', gameId)
    
    if (!error) {
      alert('Game invitation accepted!')
      fetchGames()
    }
  }

  // Filter games
  const filteredGames = games.filter(game => {
    const ageMatch = filterAge === 'all' || game.age_group === filterAge
    const statusMatch = filterStatus === 'all' || game.status === filterStatus
    
    // Date filter
    let dateMatch = true
    if (filterDate !== 'all') {
      const gameDate = new Date(game.game_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (filterDate === 'today') {
        dateMatch = gameDate.toDateString() === today.toDateString()
      } else if (filterDate === 'week') {
        const weekFromNow = new Date(today)
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        dateMatch = gameDate >= today && gameDate <= weekFromNow
      } else if (filterDate === 'month') {
        const monthFromNow = new Date(today)
        monthFromNow.setMonth(monthFromNow.getMonth() + 1)
        dateMatch = gameDate >= today && gameDate <= monthFromNow
      }
    }
    
    return ageMatch && statusMatch && dateMatch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">🏒 HockeyHub</a>
          <div className="flex gap-4">
            <a href="/games" className="text-blue-600">Games</a>
            <a href="/rinks" className="text-gray-600">Rinks</a>
            <a href="/clubs" className="text-gray-600">Clubs</a>
            <a href="/profile" className="text-gray-600">Profile</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Upcoming Games</h1>
          <a
            href="/games/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Post Game Invitation
          </a>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Group
              </label>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Ages</option>
                <option value="U7">U7</option>
                <option value="U9">U9</option>
                <option value="U11">U11</option>
                <option value="U13">U13</option>
                <option value="U15">U15</option>
                <option value="U18">U18</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="matched">Matched</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterAge('all')
                  setFilterStatus('all')
                  setFilterDate('all')
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Games List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredGames.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No games found</p>
            <a
              href="/games/new"
              className="text-blue-600 hover:text-blue-700"
            >
              Be the first to post a game!
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredGames.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{game.title}</h3>
                    <p className="text-gray-600 mt-1">
                      📅 {new Date(game.game_date).toLocaleDateString()} at {game.game_time}
                    </p>
                    <p className="text-gray-600">
                      📍 {game.rinks?.name || 'Location TBD'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {game.age_group || 'All Ages'}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {game.skill_level || 'All Levels'}
                      </span>
                    </div>
                    {game.description && (
                      <p className="text-gray-600 mt-3">{game.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded text-sm ${
                      game.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {game.status === 'matched' ? 'Matched' : 'Open'}
                    </span>
                    {game.status === 'open' && user && game.created_by !== user.id && (
                      <button
                        onClick={() => handleRespond(game.id)}
                        className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Accept Invitation
                      </button>
                    )}
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