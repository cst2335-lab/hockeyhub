'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CheckDatabaseClient() {
  const [tables, setTables] = useState<Record<string, { exists: boolean; error?: string; count?: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTables = async () => {
      const supabase = createClient();
      const tablesToCheck = [
        'game_invitations',
        'game_interests',
        'notifications',
        'rinks',
        'bookings',
        'profiles',
        'ratings',
        'messages',
      ];

      const results: Record<string, { exists: boolean; error?: string; count?: number }> = {};

      for (const table of tablesToCheck) {
        try {
          const { error } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1);

          if (error) {
            results[table] = { exists: false, error: error.message };
          } else {
            const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
            results[table] = { exists: true, count: count ?? 0 };
          }
        } catch (err) {
          results[table] = { exists: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
      }

      setTables(results);
      setLoading(false);
    };

    checkTables();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Checking database tables...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">GoGoHockey - Database Status Check</h1>

          <div className="space-y-2">
            {Object.entries(tables).map(([table, info]) => (
              <div
                key={table}
                className={`p-3 rounded-lg flex justify-between items-center ${info.exists ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.exists ? '✅' : '❌'}</span>
                  <span className="font-medium">{table}</span>
                </div>
                <div>
                  {info.exists ? (
                    <span className="text-green-700 font-semibold">{info.count} records</span>
                  ) : (
                    <span className="text-red-700 text-sm">{info.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Summary:</h2>
            <p>✅ Existing tables: {Object.values(tables).filter((t) => t.exists).length}</p>
            <p>❌ Missing tables: {Object.values(tables).filter((t) => !t.exists).length}</p>
            {tables.rinks?.exists && (
              <p className="mt-2 text-green-700 font-semibold">🏒 Rinks table has {tables.rinks.count} ice rinks!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
