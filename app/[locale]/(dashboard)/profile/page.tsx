'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {createClient} from '@/lib/supabase/client';
import {User} from '@supabase/supabase-js';
import {useRouter, useParams} from 'next/navigation';
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
  const t = useTranslations('profilePage');
  const {locale} = useParams<{locale: string}>();

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
      const {
        data: {user},
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        // Localized login redirect
        router.push(`/${locale}/login`);
        return;
      }

      setUser(user);

      const {data: profileData, error: profileError} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Create a profile row if not found
      if (profileError && (profileError as any).code === 'PGRST116') {
        const fallbackName =
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Hockey Player';

        const {data: newProfile, error: insertError} = await supabase
          .from('profiles')
          .insert([{id: user.id, full_name: fallbackName, email: user.email}])
          .select()
          .single();

        if (insertError) {
          // Fallback to upsert
          const {data: upsertProfile, error: upsertError} = await supabase
            .from('profiles')
            .upsert({id: user.id, full_name: fallbackName, email: user.email})
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

  const getSkillLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      AAA: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      AA: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      A: 'bg-gogo-secondary/20 text-gogo-primary',
      B: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      C: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      'House League': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      Beginner: 'bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300'
    };
    return colors[level] || 'bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300';
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Forward':
        return '⚡';
      case 'Defense':
        return '🛡️';
      case 'Goalie':
        return '🥅';
      default:
        return '🏒';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary"></div>
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
          <p className="text-muted-foreground">{t('notFound')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-gogo-primary hover:text-gogo-dark dark:hover:text-sky-300 underline"
          >
            {t('reloadPage')}
          </button>
        </div>
      </div>
    );
  }

  const isIncomplete =
    !profile.age_group || !profile.skill_level || !profile.position || !profile.area;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Incomplete profile alert */}
        {isIncomplete && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('completeTitle')}
                </h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  {t('completeDesc')}
                </p>
                <button
                  onClick={() => router.push(`/${locale}/profile/edit`)}
                  className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-200 hover:underline"
                >
                  {t('completeNow')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header card */}
        <div className="bg-card border border-border shadow-xl rounded-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-gogo-primary to-gogo-secondary"></div>

          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 left-6">
              <div className="h-24 w-24 rounded-full bg-card border-4 border-card shadow-lg flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>

            {/* Edit button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => router.push(`/${locale}/profile/edit`)}
                className="flex items-center space-x-2 px-4 py-2 bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark transition"
              >
                <Edit2 className="h-4 w-4" />
                <span>{t('editProfile')}</span>
              </button>
            </div>

            {/* Name and badges */}
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-foreground">
                {profile.full_name || t('hockeyPlayer')}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {profile.age_group && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300">
                    {profile.age_group}
                  </span>
                )}
                {profile.skill_level && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(
                      profile.skill_level
                    )}`}
                  >
                    {profile.skill_level}
                  </span>
                )}
                {profile.position && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gogo-secondary/20 text-gogo-primary">
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
          <div className="bg-card border border-border shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('contactInfo')}</h2>
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                <span>{user?.email || profile.email || t('noEmail')}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                <span className={!profile.phone ? 'text-muted-foreground/70' : ''}>
                  {profile.phone || t('addPhone')}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                <span className={!profile.area ? 'text-muted-foreground/70' : ''}>
                  {profile.area || t('addLocation')}
                </span>
              </div>
            </div>
          </div>

          {/* Hockey profile */}
          <div className="bg-card border border-border shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('hockeyProfile')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Trophy className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                  {t('experience')}
                </span>
                <span className={`font-medium ${!profile.years_playing ? 'text-muted-foreground/70' : ''}`}>
                  {profile.years_playing ? `${profile.years_playing} years` : t('notSpecified')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Target className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                  {t('shoots')}
                </span>
                <span className={`font-medium ${!profile.preferred_shot ? 'text-muted-foreground/70' : ''}`}>
                  {profile.preferred_shot || t('notSpecified')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Shield className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                  {t('position')}
                </span>
                <span className={`font-medium ${!profile.position ? 'text-muted-foreground/70' : ''}`}>
                  {profile.position || t('notSpecified')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                  {t('ageGroup')}
                </span>
                <span className={`font-medium ${!profile.age_group ? 'text-muted-foreground/70' : ''}`}>
                  {profile.age_group || t('notSpecified')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats preview (placeholder) */}
        <div className="mt-6 bg-card border border-border shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('seasonStats')}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted dark:bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-gogo-primary">0</p>
              <p className="text-sm text-muted-foreground mt-1">{t('gamesPlayed')}</p>
            </div>
            <div className="bg-muted dark:bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
              <p className="text-sm text-muted-foreground mt-1">{t('gamesOrganized')}</p>
            </div>
            <div className="bg-muted dark:bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</p>
              <p className="text-sm text-muted-foreground mt-1">{t('teamsJoined')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
