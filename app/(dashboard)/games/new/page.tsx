'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewGamePage() {
  const [title, setTitle] = useState('')
  const [gameDate, setGameDate] = useState('')
  const [gameTime, setGameTime] = useState('')
  const [rinkId, setRinkId] = useState('')
  const [ageGroup, setAgeGroup] = useState('U13')
  const [skillLevel, setSkillLevel] = useState('Intermediate')
  const [description, setDescription] = useState('')
  const [rinks, setRinks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRinks()
  }, [])

  const fetchRinks = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('rinks').select('*')
    if (data) setRinks(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please login to post a game')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('game_invitations').insert({
      title,
      game_date: gameDate,
      game_time: gameTime,
      rink_id: rinkId || null,
      age_group: ageGroup,
      skill_level: skillLevel,
      description,
      created_by: user.id,
      status: 'open'
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Game posted successfully!')
      setTimeout(() => {
        window.location.href = '/games'
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <a href="/games" className="text-gray-600">← Back to Games</a>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Post Game Invitation</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Friendly Match - Looking for U13 Team"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                required
                value={gameTime}
                onChange={(e) => setGameTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rink
            </label>
            <select
              value={rinkId}
              onChange={(e) => setRinkId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a rink...</option>
              {rinks.map((rink) => (
                <option key={rink.id} value={rink.id}>
                  {rink.name} - {rink.address}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
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
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Elite">Elite</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add any additional details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {message && (
            <div className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Game Invitation'}
          </button>
        </form>
      </div>
    </div>
  )
}