// app/[locale]/(dashboard)/my-games/page.tsx
'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {Calendar, Clock, Eye, Users, MapPin, PlusCircle} from 'lucide-react';

type Game = {
  id: string;
  title: string;
  game_date: string | null;
  game_time: string | null;
  age_group: string | null;
  skill_level: string | null;
  status: 'open' | 'matched' | 'cancelled';
  created_by: string;
  location?: string | null;
  rink_id?: string | null;
  view_count?: number | null;
  interested_count?: number | null;
  created_at: string;
};

export default function MyGamesPage() {
  // Read locale from the dynamic segment: /{locale}/...
  const {locale} = useParams<{locale: string}>();
  const router = useRouter();
  const supabase = createClient();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to prefix a path with /{locale}
  const withLocale = useCallback(
    (p: string) => `/${locale || ''}${p}`.replace('//', '/'),
    [locale]
  );

  const loadMyGames = useCallback(async () => {
    try {
      const {
        data: {user},
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        router.push(withLocale('/login'));
        return;
      }

      const {data, error} = await supabase
        .from('game_invitations')
        .select(
          'id,title,game_date,game_time,age_group,skill_level,status,created_by,location,rink_id,view_count,interested_count,created_at'
        )
        .eq('created_by', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;

      setGames((data || []) as Game[]);
    } catch (err) {
      console.error('Failed to load my games:', err);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [router, supabase, withLocale]);

  useEffect(() => {
    loadMyGames();
  }, [loadMyGames]);

  const formatDate = (d?: string | null) => {
    if (!d) return 'TBD';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? 'TBD' : dt.toLocaleDateString();
  };

  const statusBadge = (status: Game['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Games</h1>
        <Link
          href={withLocale('/games/create')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          Post a Game
        </Link>
      </div>

      {/* Empty state */}
      {games.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">You have not posted any games yet.</p>
          <Link
            href={withLocale('/games/create')}
            className="inline-block mt-4 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Create your first game
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map((g) => (
            <Link
              key={g.id}
              href={withLocale(`/games/${g.id}`)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                {/* Left */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-semibold truncate">{g.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(g.status)}`}>
                      {g.status}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-gray-600 text-sm">
                    <span className="inline-flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(g.game_date)}
                    </span>
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {g.game_time || 'TBD'}
                    </span>
                    {g.location && (
                      <span className="inline-flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {g.location}
                      </span>
                    )}
                    {g.age_group && <span>Age: {g.age_group}</span>}
                    {g.skill_level && <span>Level: {g.skill_level}</span>}
                  </div>
                </div>

                {/* Right */}
                <div className="text-right shrink-0">
                  <div className="text-sm text-gray-500 flex items-center justify-end gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{g.view_count ?? 0}</span>
                    <Users className="h-4 w-4 ml-3" />
                    <span>{g.interested_count ?? 0}</span>
                  </div>
                  <div className="mt-2 text-blue-600 text-sm">View details →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
