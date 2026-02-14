//app/[locale]/(auth)/login/LoginClient.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SlimLayout } from '@/components/layout/slim-layout';
import { Logo } from '@/components/ui/logo';

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
    <SlimLayout>
      <div className="flex">
        <Link href={`/${locale}`} aria-label="Home">
          <Logo size="md" showText={true} light={false} className="h-10 w-auto" />
        </Link>
      </div>
      <h2 className="mt-20 text-lg font-semibold text-foreground">Welcome back</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to your account
      </p>

      <form className="mt-10 grid grid-cols-1 gap-y-8" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-primary"
              />
            </div>
          </div>

          {message && (
            <div className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gogo-primary hover:bg-gogo-dark text-white font-medium rounded-lg disabled:opacity-50 focus:ring-2 focus:ring-gogo-secondary focus:ring-offset-2 dark:ring-offset-card"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={`/${locale}/register`} className="font-medium text-gogo-primary hover:text-gogo-dark">
            Sign up
          </Link>
        </div>
      </form>
    </SlimLayout>
  );
}