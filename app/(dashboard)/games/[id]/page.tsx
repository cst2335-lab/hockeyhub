'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Phone,
  Mail,
  User,
  Heart,
  AlertCircle,
  Eye
} from 'lucide-react';

interface GameDetails {
  id: string;
  title: string;
  game_date: string;
  game_time: string;
  age_group: string;
  skill_level: string;
  description: string;
  status: string;
  location?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  view_count?: number;
  interested_count?: number;
  created_at: string;
  created_by: string;
}

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInterested, setIsInterested] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  async function loadGame() {
    try {
      console.log('Loading game with ID:', gameId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        console.log('Current user:', user.id);
      }

      // Load game
      const { data: gameData, error } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('id', gameId)
        .single();

      console.log('Game query result:', { gameData, error });

      if (error) {
        console.error('Database error:', error);
        return;
      }

      if (gameData) {
        setGame(gameData);
        
        // Check if user is interested
        if (user) {
          const { data: interest } = await supabase
            .from('game_interests')
            .select('id')
            .eq('game_id', gameId)
            .eq('user_id', user.id)
            .single();
          
          if (interest) {
            setIsInterested(true);
            setShowContact(true);
          }
          
          // Show contact if user is creator
          if (user.id === gameData.created_by) {
            setShowContact(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInterest() {
    if (!currentUserId) {
      alert('Please login to show interest');
      return;
    }

    try {
      if (isInterested) {
        // Remove interest
        await supabase
          .from('game_interests')
          .delete()
          .match({ game_id: gameId, user_id: currentUserId });
        
        setIsInterested(false);
        setShowContact(false);
      } else {
        // Add interest
        await supabase
          .from('game_interests')
          .insert({
            game_id: gameId,
            user_id: currentUserId,
            status: 'interested'
          });
        
        setIsInterested(true);
        setShowContact(true);
      }
      
      // Reload to update counts
      loadGame();
    } catch (error) {
      console.error('Error handling interest:', error);
      alert('Failed to update interest status');
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Game not found</p>
          <p className="text-xs text-gray-400 mb-4">ID: {gameId}</p>
          <button
            onClick={() => router.push('/games')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to games
          </button>
        </div>
      </div>
    );
  }

  const isCreator = currentUserId === game.created_by;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/games')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">{game.title}</h1>
            <div className="flex items-center space-x-4 text-blue-100">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {game.view_count || 0} views
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {game.interested_count || 0} interested
              </span>
              {game.status === 'matched' && (
                <span className="bg-green-500 px-2 py-1 rounded text-xs">
                  Matched
                </span>
              )}
            </div>
          </div>

          {/* Game Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Game Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                      {formatDate(game.game_date)}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-5 w-5 mr-3 text-gray-400" />
                      {game.game_time || 'Time TBD'}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                      {game.location || 'Location TBD'}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="h-5 w-5 mr-3 text-gray-400" />
                      {game.age_group} - {game.skill_level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {game.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {showContact && (game.contact_person || game.contact_phone || game.contact_email) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">
                  Contact Information
                  {!isCreator && isInterested && (
                    <span className="ml-2 text-xs font-normal text-blue-700">
                      (Visible because you showed interest)
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {game.contact_person && (
                    <div className="flex items-center text-gray-700">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      {game.contact_person}
                    </div>
                  )}
                  {game.contact_phone && (
                    <div className="flex items-center text-gray-700">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      <a href={`tel:${game.contact_phone}`} className="hover:underline">
                        {game.contact_phone}
                      </a>
                    </div>
                  )}
                  {game.contact_email && (
                    <div className="flex items-center text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <a href={`mailto:${game.contact_email}`} className="hover:underline">
                        {game.contact_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            {!isCreator && game.status !== 'matched' && (
              <div className="mt-6">
                <button
                  onClick={handleInterest}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                    isInterested
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isInterested ? (
                    <>
                      <Heart className="inline h-5 w-5 mr-2 fill-current" />
                      You showed interest (Click to cancel)
                    </>
                  ) : (
                    <>
                      <Heart className="inline h-5 w-5 mr-2" />
                      I'm Interested in This Game
                    </>
                  )}
                </button>
                {!showContact && !isInterested && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Contact information will be revealed after showing interest
                  </p>
                )}
              </div>
            )}

            {/* Creator View */}
            {isCreator && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  You created this game. {game.interested_count || 0} teams have shown interest.
                </p>
                {(game.interested_count || 0) > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Check the notifications section to see who's interested.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}