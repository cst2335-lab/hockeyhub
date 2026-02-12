// app/[locale]/(dashboard)/games-test/page.tsx
'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';

type Game = {
  id: string;
  title: string | null;
  game_date: string | null; // yyyy-mm-dd
  game_time: string | null; // HH:mm
  age_group: string | null;
  skill_level: string | null;
  status: string | null;
  view_count?: number | null;
  interested_count?: number | null;
};

export default function GamesTestPage() {
  const {locale} = useParams<{locale: string}>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const withLocale = useCallback((p: string) => `/${locale || ''}${p}`.replace('//', '/'), [locale]);

  const load = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) {
        router.push(withLocale('/login'));
        return;
      }

      // 这里作为“测试页”，取最近 30 天内创建的 invitation 做演示
      const {data, error} = await supabase
        .from('game_invitations')
        .select('id,title,game_date,game_time,age_group,skill_level,status,view_count,interested_count')
        .order('created_at', {ascending: false})
        .limit(20);

      if (error) throw error;
      setGames(data || []);
    } catch (e) {
      console.error('load games-test error:', e);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [router, supabase, withLocale]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Games Test</h1>
        <Link
          href={withLocale('/games/new')}
          className="px-4 py-2 rounded-md bg-gogo-primary text-white hover:bg-gogo-dark"
        >
          Post a Game
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No sample data yet.</p>
          <p className="text-gray-500 mt-1">Try posting a game, then refresh this page.</p>
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
                <div>
                  <h3 className="text-lg font-semibold">{g.title || 'Untitled Game'}</h3>
                  <p className="text-gray-600 mt-1">
                    📅 {g.game_date || 'TBD'} ⏰ {g.game_time || 'TBD'}
                  </p>
                  <p className="text-gray-600">
                    {g.age_group || 'Age?'} · {g.skill_level || 'Level?'}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>👁 {g.view_count ?? 0}</div>
                  <div>❤️ {g.interested_count ?? 0}</div>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded bg-gray-100">
                    {g.status ?? 'open'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
