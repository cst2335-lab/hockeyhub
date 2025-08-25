'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Trophy, Save, X } from 'lucide-react';

interface GameData {
  title: string;
  game_date: string;
  game_time: string;
  location: string;
  age_group: string;
  skill_level: string;
  description: string;
  max_players: string;
  contact_info: string;
  status: string;
}

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [formData, setFormData] = useState<GameData>({
    title: '',
    game_date: '',
    game_time: '',
    location: '',
    age_group: 'U11',
    skill_level: 'Intermediate',
    description: '',
    max_players: '',
    contact_info: '',
    status: 'open'
  });

  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

  useEffect(() => {
    loadGame();
  }, [gameId]);

  async function loadGame() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load game data
      const { data: game, error } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error || !game) {
        alert('Game not found');
        router.push('/my-games');
        return;
      }

      // Check if user is the owner
      if (game.created_by !== user.id) {
        alert('You can only edit your own games');
        router.push(`/games/${gameId}`);
        return;
      }

      setIsOwner(true);
      setFormData({
        title: game.title || '',
        game_date: game.game_date || '',
        game_time: game.game_time || '',
        location: game.location || '',
        age_group: game.age_group || 'U11',
        skill_level: game.skill_level || 'Intermediate',
        description: game.description || '',
        max_players: game.max_players?.toString() || '',
        contact_info: game.contact_info || '',
        status: game.status || 'open'
      });

    } catch (error) {
      console.error('Error loading game:', error);
      alert('Failed to load game');
      router.push('/my-games');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('game_invitations')
        .update({
          title: formData.title,
          game_date: formData.game_date,
          game_time: formData.game_time,
          location: formData.location,
          age_group: formData.age_group,
          skill_level: formData.skill_level,
          description: formData.description,
          max_players: formData.max_players ? parseInt(formData.max_players) : null,
          contact_info: formData.contact_info,
          status: formData.status
        })
        .eq('id', gameId);

      if (error) throw error;

      // Success - redirect to game details
      router.push(`/games/${gameId}`);
      
    } catch (error: any) {
      console.error('Error updating game:', error);
      alert(error.message || 'Failed to update game');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">You don't have permission to edit this game</p>
          <Link href="/my-games" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to My Games
          </Link>
        </div>
      </div>
    );
  }

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-games"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Games
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Game</h1>
          <p className="mt-2 text-gray-600">Update your game information</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Game Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open - Accepting responses</option>
              <option value="matched">Matched - Found opponent</option>
              <option value="cancelled">Cancelled - No longer available</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Game Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., U13 Friendly Match Looking for Opponent"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="game_date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Game Date *
              </label>
              <input
                type="date"
                id="game_date"
                name="game_date"
                required
                value={formData.game_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="game_time" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Game Time *
              </label>
              <input
                type="time"
                id="game_time"
                name="game_time"
                required
                value={formData.game_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Bell Sensplex, Kanata"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Age Group and Skill Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age_group" className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Age Group *
              </label>
              <select
                id="age_group"
                name="age_group"
                required
                value={formData.age_group}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ageGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700 mb-2">
                <Trophy className="inline h-4 w-4 mr-1" />
                Skill Level *
              </label>
              <select
                id="skill_level"
                name="skill_level"
                required
                value={formData.skill_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {skillLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label htmlFor="max_players" className="block text-sm font-medium text-gray-700 mb-2">
              Max Players (Optional)
            </label>
            <input
              type="number"
              id="max_players"
              name="max_players"
              min="1"
              max="50"
              value={formData.max_players}
              onChange={handleChange}
              placeholder="e.g., 20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide additional details about the game, rules, or requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contact Info */}
          <div>
            <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information (Optional)
            </label>
            <input
              type="text"
              id="contact_info"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              placeholder="e.g., Coach John - 613-555-0123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be shared only with interested teams
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/my-games"
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center transition flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}