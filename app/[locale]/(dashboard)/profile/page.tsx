// app/[locale]/(dashboard)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter, useParams } from 'next/navigation';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Trophy, 
  Calendar,
  Shield,
  Target,
  Edit2,
  AlertCircle
} from 'lucide-react';

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
  created_at?: string;
}

export default function ProfilePage() {
  // Read locale from URL params
  const { locale } = useParams<{ locale: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getProfile() {
    try {
      setError(null);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      setUser(user);

      // Query profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile not found, create one
      if (profileError && (profileError as any).code === 'PGRST116') {
        const fallbackName =
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Hockey Player';

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, full_name: fallbackName, email: user.email }])
          .select()
          .single();

        if (insertError) {
          // Fallback to upsert
          const { data: upsertProfile, error: upsertError } = await supabase
            .from('profiles')
            .upsert({ id: user.id, full_name: fallbackName, email: user.email })
            .select()
            .single();

          if (upsertError) throw upsertError;
          setProfile(upsertProfile);
        } else {
          setProfile(newProfile);
        }
      } else if (profileError) {
        throw profileError;
      } else {
        setProfile(profileData);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  // Badge color for skill level
  const getSkillLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      AAA: 'bg-purple-100 text-purple-800',
      AA: 'bg-indigo-100 text-indigo-800',
      A: 'bg-blue-100 text-blue-800',
      B: 'bg-green-100 text-green-800',
      C: 'bg-yellow-100 text-yellow-800',
      'House League': 'bg-orange-100 text-orange-800',
      Beginner: 'bg-gray-100 text-gray-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  // Tiny icon for position
  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Forward': return '⚡';
      case 'Defense': return '🛡️';
      case 'Goalie': return '🥅';
      default: return '🏒';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Error loading profile</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Profile not found</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-blue-600 hover:text-blue-800 underline"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }

  // Incomplete profile hint
  const isIncomplete =
    !profile.age_group || !profile.skill_level || !profile.position || !profile.area;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Incomplete profile alert */}
        {isIncomplete && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Complete your profile</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Add your hockey details to find better game matches and connect with other players.
                </p>
                <button
                  onClick={() => router.push(`/${locale}/profile/edit`)}
                  className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                >
                  Complete now →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 left-6">
              <div className="h-24 w-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
            </div>

            {/* Edit button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => router.push(`/${locale}/profile/edit`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Name and badges */}
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.full_name || 'Hockey Player'}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.age_group && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {profile.age_group}
                  </span>
                )}
                {profile.skill_level && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(profile.skill_level)}`}>
                    {profile.skill_level}
                  </span>
                )}
                {profile.position && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getPositionIcon(profile.position)} {profile.position}
                  </span>
                )}
                {profile.jersey_number && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    #{profile.jersey_number}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <span>{user?.email || profile.email || 'No email'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                <span className={!profile.phone ? 'text-gray-400' : ''}>
                  {profile.phone || 'Add phone number'}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <span className={!profile.area ? 'text-gray-400' : ''}>
                  {profile.area || 'Add location'}
                </span>
              </div>
            </div>
          </div>

          {/* Hockey profile */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hockey Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Trophy className="h-5 w-5 mr-3 text-gray-400" />
                  Experience
                </span>
                <span className={`font-medium ${!profile.years_playing ? 'text-gray-400' : ''}`}>
                  {profile.years_playing ? `${profile.years_playing} years` : 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Target className="h-5 w-5 mr-3 text-gray-400" />
                  Shoots
                </span>
                <span className={`font-medium ${!profile.preferred_shot ? 'text-gray-400' : ''}`}>
                  {profile.preferred_shot || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Shield className="h-5 w-5 mr-3 text-gray-400" />
                  Position
                </span>
                <span className={`font-medium ${!profile.position ? 'text-gray-400' : ''}`}>
                  {profile.position || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  Age Group
                </span>
                <span className={`font-medium ${!profile.age_group ? 'text-gray-400' : ''}`}>
                  {profile.age_group || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats preview (static placeholder) */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Season Statistics</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Games Played</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Games Organized</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Teams Joined</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
