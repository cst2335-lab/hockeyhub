'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import RatingStars from '@/components/rating/RatingStars'

interface Game {
  id: string
  title: string
  game_date: string
  game_time: string
  age_group: string
  skill_level: string
  description: string
  status: string
  created_by: string
  rink_id: string
  host_club_id: string
  guest_club_id: string | null
  view_count?: number
  interested_count?: number
  created_at: string
  creator?: {
    full_name: string
    email: string
    phone: string
  }
  host_club?: {
    name: string
    contact_email: string
    contact_phone: string
  }
  rink?: {
    name: string
    address: string
    phone: string
  }
}

interface GameInterest {
  id: string
  game_id: string
  user_id: string
  message: string
  status: string
  created_at: string
}

export default function GameDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isInterested, setIsInterested] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [message, setMessage] = useState('')
  const [showMessageForm, setShowMessageForm] = useState(false)
  
  // Rating states
  const [hasRated, setHasRated] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [tempRating, setTempRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')

  useEffect(() => {
    loadGameDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const loadGameDetails = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Load game details
      const { data: gameData, error: gameError } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('id', params.id)
        .single()

      if (gameError) {
        console.error('Error loading game:', gameError)
        return
      }

      // Load creator info
      if (gameData?.created_by) {
        const { data: creatorData } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', gameData.created_by)
          .single()

        if (creatorData) {
          gameData.creator = creatorData
        }
      }

      // Load host club info
      if (gameData?.host_club_id) {
        const { data: clubData } = await supabase
          .from('clubs')
          .select('name, contact_email, contact_phone')
          .eq('id', gameData.host_club_id)
          .single()

        if (clubData) {
          gameData.host_club = clubData
        }
      }

      // Load rink info
      if (gameData?.rink_id) {
        const { data: rinkData } = await supabase
          .from('rinks')
          .select('name, address, phone')
          .eq('id', gameData.rink_id)
          .single()

        if (rinkData) {
          gameData.rink = rinkData
        }
      }

      setGame(gameData)

      // Check if current user is interested
      if (user) {
        const { data: interestData } = await supabase
          .from('game_interests')
          .select('*')
          .eq('game_id', params.id)
          .eq('user_id', user.id)
          .single()

        if (interestData) {
          setIsInterested(true)
          if (interestData.status === 'accepted') {
            setShowContactInfo(true)
          }
        }

        // Check if user already rated (for matched games)
        if (gameData.status === 'matched') {
          const { data: ratingData } = await supabase
            .from('game_ratings')
            .select('*')
            .eq('game_id', params.id)
            .eq('rater_id', user.id)
            .single()
          
          if (ratingData) {
            setHasRated(true)
            setUserRating(ratingData.rating)
          }
        }
      }

      // Update view count (only if not the creator)
      if (user && gameData.created_by !== user.id) {
        await supabase
          .from('game_invitations')
          .update({ 
            view_count: (gameData.view_count || 0) + 1 
          })
          .eq('id', params.id)
      }

    } catch (error) {
      console.error('Error in loadGameDetails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInterest = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    try {
      const supabase = createClient()

      if (!isInterested) {
        // Express interest
        const { error } = await supabase
          .from('game_interests')
          .insert({
            game_id: params.id,
            user_id: currentUser.id,
            message: message,
            status: 'pending'
          })

        if (!error) {
          setIsInterested(true)
          setShowMessageForm(false)
          setMessage('')
          
          // Update interested count
          if (game) {
            await supabase
              .from('game_invitations')
              .update({ 
                interested_count: (game.interested_count || 0) + 1 
              })
              .eq('id', params.id)

            // Reload game data
            loadGameDetails()
          }
        }
      } else {
        // Remove interest
        await supabase
          .from('game_interests')
          .delete()
          .eq('game_id', params.id)
          .eq('user_id', currentUser.id)

        setIsInterested(false)
        setShowContactInfo(false)

        // Update interested count
        if (game) {
          await supabase
            .from('game_invitations')
            .update({ 
              interested_count: Math.max((game.interested_count || 0) - 1, 0)
            })
            .eq('id', params.id)

          // Reload game data
          loadGameDetails()
        }
      }
    } catch (error) {
      console.error('Error handling interest:', error)
    }
  }

  const handleSubmitRating = async () => {
    if (!currentUser || tempRating === 0) return
    
    try {
      const supabase = createClient()
      
      // Find opponent ID
      let opponentId = null
      if (isCreator) {
        // If creator, find interested user
        const { data } = await supabase
          .from('game_interests')
          .select('user_id')
          .eq('game_id', params.id)
          .single()
        opponentId = data?.user_id
      } else {
        // If participant, rate the creator
        opponentId = game?.created_by
      }

      if (!opponentId) {
        alert('Cannot determine opponent')
        return
      }
      
      const { error } = await supabase
        .from('game_ratings')
        .insert({
          game_id: params.id,
          rater_id: currentUser.id,
          rated_user_id: opponentId,
          rating: tempRating,
          comment: ratingComment.trim() || null
        })
      
      if (!error) {
        setHasRated(true)
        setUserRating(tempRating)
        
        // Update user's average rating
        const { data: ratings } = await supabase
          .from('game_ratings')
          .select('rating')
          .eq('rated_user_id', opponentId)

        if (ratings && ratings.length > 0) {
          const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          await supabase
            .from('profiles')
            .update({ 
              average_rating: avg,
              total_ratings: ratings.length
            })
            .eq('id', opponentId)
        }
        
        alert('Rating submitted successfully!')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading game details...</p>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p>Game not found</p>
          <a href="/games" className="text-blue-600 hover:underline">Back to games</a>
        </div>
      </div>
    )
  }

  const isCreator = currentUser?.id === game.created_by
  const gameDate = new Date(game.game_date).toLocaleDateString()

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
            <a href="/profile" className="text-gray-600">Profile</a>
          </div>
        </div>
      </nav>

      {/* Game Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <a href="/games" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to games
          </a>

          {/* Main content */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{game.title}</h1>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📅 {gameDate}</span>
                <span>⏰ {game.game_time}</span>
                <span>👁 {game.view_count || 0} views</span>
                <span>🏒 {game.interested_count || 0} interested</span>
              </div>
            </div>

            {/* Game Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Game Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Age Group:</strong> {game.age_group}</p>
                  <p><strong>Skill Level:</strong> {game.skill_level}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      game.status === 'open' ? 'bg-green-100 text-green-800' :
                      game.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {game.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Venue</h3>
                <div className="space-y-2 text-gray-700">
                  {game.rink && (
                    <>
                      <p><strong>{game.rink.name}</strong></p>
                      <p>{game.rink.address}</p>
                      {game.rink.phone && <p>📞 {game.rink.phone}</p>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {game.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{game.description}</p>
              </div>
            )}

            {/* Host Club */}
            {game.host_club && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Host Club</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">{game.host_club.name}</p>
                  {(showContactInfo || isCreator) && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>📧 {game.host_club.contact_email}</p>
                      {game.host_club.contact_phone && <p>📞 {game.host_club.contact_phone}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(showContactInfo || isCreator) && game.creator && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Contact Person</h3>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-medium">{game.creator.full_name}</p>
                  <p className="text-sm text-gray-600">📧 {game.creator.email}</p>
                  {game.creator.phone && <p className="text-sm text-gray-600">📞 {game.creator.phone}</p>}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-6">
              {isCreator ? (
                <div>
                  <p className="text-green-600 font-medium mb-2">
                    You created this game. {(game.interested_count || 0) > 0 ? `${game.interested_count || 0} teams have shown interest.` : 'No teams have shown interest yet.'}
                  </p>
                  {(game.interested_count || 0) > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Check the notifications section to see who's interested.
                    </p>
                  )}
                </div>
              ) : currentUser ? (
                <div>
                  {!isInterested && !showMessageForm && (
                    <button
                      onClick={() => setShowMessageForm(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      I'm Interested
                    </button>
                  )}

                  {showMessageForm && !isInterested && (
                    <div className="space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message (optional)"
                        className="w-full p-3 border rounded-lg"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleInterest}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Send Interest
                        </button>
                        <button
                          onClick={() => {
                            setShowMessageForm(false)
                            setMessage('')
                          }}
                          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {isInterested && (
                    <div>
                      <p className="text-green-600 font-medium mb-2">
                        ✅ You've expressed interest in this game
                      </p>
                      {showContactInfo && (
                        <p className="text-sm text-gray-600 mb-4">
                          Contact information is now visible to you.
                        </p>
                      )}
                      <button
                        onClick={handleInterest}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Remove Interest
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">Sign in to express interest in this game</p>
                 <a 
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
                  >
                    Sign In
                  </a>
                </div>
              )}
            </div>

            {/* Rating Section - NEW */}
            {game.status === 'matched' && currentUser && (isCreator || isInterested) && (
              <div className="border-t mt-6 pt-6">
                <h3 className="font-semibold mb-4">Rate This Game</h3>
                
                {hasRated ? (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-600">✅ You have already rated this game</p>
                    <div className="mt-2">
                      <RatingStars rating={userRating} readonly showNumber />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        How was your experience?
                      </label>
                      <RatingStars 
                        rating={tempRating} 
                        onChange={setTempRating}
                        size="lg"
                      />
                    </div>
                    
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience (optional)"
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    
                    <button
                      onClick={handleSubmitRating}
                      disabled={tempRating === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}