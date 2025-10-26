'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email?: string;
  age_group?: string;
  skill_level?: string;
  position?: string;
  area?: string;
  years_playing?: number;
  phone?: string;
  jersey_number?: string;
  preferred_shot?: string;
  bio?: string;
}

export default function EditProfilePage() {
  // Read locale from URL params
  const { locale } = useParams<{ locale: string }>();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          age_group: profile.age_group,
          skill_level: profile.skill_level,
          position: profile.position,
          area: profile.area,
          years_playing: profile.years_playing,
          phone: profile.phone,
          jersey_number: profile.jersey_number,
          preferred_shot: profile.preferred_shot,
          bio: profile.bio,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Redirect back to localized profile after save
      setTimeout(() => {
        router.push(`/${locale}/profile`);
      }, 1500);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${locale}/profile`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">Update your hockey profile information</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="(613) 555-0100"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Area/Location *</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.area || ''}
                  onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                >
                  <option value="">Select your area</option>
                  <option value="Downtown Ottawa">Downtown Ottawa</option>
                  <option value="Ottawa East">Ottawa East</option>
                  <option value="Ottawa West">Ottawa West</option>
                  <option value="Ottawa South">Ottawa South</option>
                  <option value="Kanata">Kanata</option>
                  <option value="Nepean">Nepean</option>
                  <option value="Orleans">Orleans</option>
                  <option value="Gloucester">Gloucester</option>
                  <option value="Barrhaven">Barrhaven</option>
                  <option value="Stittsville">Stittsville</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hockey Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hockey Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age Group *</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.age_group || ''}
                  onChange={(e) => setProfile({ ...profile, age_group: e.target.value })}
                >
                  <option value="">Select age group</option>
                  <option value="U7">U7</option>
                  <option value="U9">U9</option>
                  <option value="U11">U11</option>
                  <option value="U13">U13</option>
                  <option value="U15">U15</option>
                  <option value="U18">U18</option>
                  <option value="Adult">Adult</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skill Level *</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.skill_level || ''}
                  onChange={(e) => setProfile({ ...profile, skill_level: e.target.value })}
                >
                  <option value="">Select skill level</option>
                  <option value="AAA">AAA</option>
                  <option value="AA">AA</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="House League">House League</option>
                  <option value="Beginner">Beginner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Position *</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.position || ''}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                >
                  <option value="">Select position</option>
                  <option value="Forward">Forward</option>
                  <option value="Defense">Defense</option>
                  <option value="Goalie">Goalie</option>
                  <option value="Any">Any Position</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Shot</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.preferred_shot || ''}
                  onChange={(e) => setProfile({ ...profile, preferred_shot: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                </select>
              </div>

              <div>
                <label className="block text sm font-medium text-gray-700">Years Playing</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={profile.years_playing || 0}
                  onChange={(e) =>
                    setProfile({ ...profile, years_playing: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Jersey Number</label>
                <input
                  type="text"
                  maxLength={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="99"
                  value={profile.jersey_number || ''}
                  onChange={(e) => setProfile({ ...profile, jersey_number: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About You</h2>
            <textarea
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tell us about your hockey experience, favorite teams, or anything else..."
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/profile`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
