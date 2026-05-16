'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestConnectionClient() {
  const [status, setStatus] = useState<string>('Checking...');
  const [details, setDetails] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setStatus('❌ Environment variables not configured');
      setDetails({
        url: supabaseUrl ? '✅ Configured' : '❌ Not found',
        key: supabaseKey ? '✅ Configured' : '❌ Not found',
      });
      return;
    }

    const supabase = createClient();
    supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (error) {
          setStatus('⚠️ Connection issue');
          setDetails({
            url: '✅ Configured',
            key: '✅ Configured',
            error: error.message,
          });
        } else {
          setStatus('✅ Supabase connected successfully!');
          setDetails({
            url: '✅ Configured',
            key: '✅ Configured',
            connection: '✅ Database accessible',
          });
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card text-card-foreground rounded-lg shadow-xl p-8 border border-border">
          <h1 className="text-3xl font-bold mb-6 text-foreground">GoGoHockey - Supabase Connection Test</h1>
          <div className="mb-6">
            <div className="text-2xl font-semibold mb-4">{status}</div>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Details:</h2>
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex items-start">
                <span className="font-medium text-muted-foreground min-w-[100px]">{key}:</span>
                <span className="text-foreground ml-2">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">Dev only: /test-connection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
