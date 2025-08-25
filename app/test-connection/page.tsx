'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Checking...');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    // Test environment variables
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

    // Test connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple connection test
    supabase
      .from('users')
      .select('count')
      .limit(1)
      .then(({ error }) => {
        if (error && error.message.includes('does not exist')) {
          setStatus('✅ Supabase connected successfully!');
          setDetails({
            url: '✅ ' + supabaseUrl,
            key: '✅ Key loaded',
            connection: '✅ Database accessible',
            note: 'Tables may not be created yet, but connection is working'
          });
        } else if (error) {
          setStatus('⚠️ Connection issue');
          setDetails({
            url: '✅ ' + supabaseUrl,
            key: '✅ Key loaded',
            error: error.message
          });
        } else {
          setStatus('✅ Supabase connected successfully!');
          setDetails({
            url: '✅ ' + supabaseUrl,
            key: '✅ Key loaded',
            connection: '✅ Database connection normal'
          });
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Supabase Connection Test
          </h1>
          
          <div className="mb-6">
            <div className="text-2xl font-semibold mb-4">{status}</div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-700">Details:</h2>
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex items-start">
                <span className="font-medium text-gray-600 min-w-[100px]">
                  {key}:
                </span>
                <span className="text-gray-800 ml-2">{String(value)}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Visit this page: http://localhost:3000/test-connection
            </p>
            <p className="text-sm text-blue-600 mt-2">
              If connection is successful, you can delete this test page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}