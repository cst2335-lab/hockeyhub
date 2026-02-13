//app/[locale]/(auth)/login/LoginClient.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LoginClient() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? 'en';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Login successful!');
      window.location.href = `/${locale}/dashboard`;
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-primary"
              />
            </div>
          </div>

          {message && (
            <div className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gogo-primary hover:bg-gogo-dark text-white font-medium rounded-md disabled:opacity-50 focus:ring-2 focus:ring-gogo-secondary focus:ring-offset-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href={`/${locale}/register`} className="text-gogo-primary hover:text-gogo-dark">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}