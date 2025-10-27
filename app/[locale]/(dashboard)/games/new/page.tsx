'use client';

import {useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft, Calendar, Clock, MapPin, Users, Trophy} from 'lucide-react';

export default function CreateGamePage() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Derive locale from the first path segment: /{locale}/...
  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname]);

  // Helper to build a locale-prefixed path
  const withLocale = (p: string) => `/${locale || ''}${p}`.replace('//', '/');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    game_date: '',
    game_time: '',
    location: '',
    age_group: 'U11',
    skill_level: 'Intermediate',
    description: '',
    max_players: '',
    contact_info: ''
  });

  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Require auth and redirect to localized login
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(withLocale('/login'));
        return;
      }

      // Create game invitation
      const {data, error} = await supabase
        .from('game_invitations')
        .insert({
          title: formData.title,
          game_date: formData.game_date,
          game_time: formData.game_time,
          location: formData.location,
          age_group: formData.age_group,
          skill_level: formData.skill_level,
          description: formData.description,
          max_players: formData.max_players ? parseInt(formData.max_players) : null,
          contact_info: formData.contact_info,
          status: 'open',
          created_by: user.id,
          view_count: 0,
          interested_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Localized redirect to details page
      router.push(withLocale(`/games/${data.id}`));
    } catch (error: any) {
      console.error('Error creating game:', error);
      alert(error.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  // Use tomorrow as the earliest selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={withLocale('/games')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Post a Game</h1>
          <p className="mt-2 text-gray-600">Create a game invitation for other teams</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                min={minDate}
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
                  <option key={group} value={group}>
                    {group}
                  </option>
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
                  <option key={level} value={level}>
                    {level}
                  </option>
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
            <p className="mt-1 text-sm text-gray-500">This will be shared only with interested teams</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Post Game'}
            </button>
            <Link
              href={withLocale('/games')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center transition"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for a successful game post:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include specific time and location details</li>
            <li>• Be clear about skill level expectations</li>
            <li>• Mention if you have ice time already booked</li>
            <li>• Provide contact information for quick responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
