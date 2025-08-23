'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">🏒 HockeyHub</a>
          <div className="flex gap-4">
            <a href="/games" className="text-blue-600">Games</a>
            <a href="/rinks" className="text-gray-600">Rinks</a>
            <a href="/clubs" className="text-gray-600">Clubs</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Upcoming Games</h1>
          <a 
            href="/games/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Post Game Invitation
          </a>
        </div>

        {loading ? (
          <p>Loading games...</p>
        ) : games.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No games posted yet</p>
            <a 
              href="/games/new"
              className="text-blue-600 hover:text-blue-700"
            >
              Be the first to post a game!
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {games.map((game) => (
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
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${
                    game.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {game.status}
                  </span>
                </div>
                {game.description && (
                  <p className="text-gray-600 mt-3">{game.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}