//components/auth/AuthActions.tsx
'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';

function useLocale() {
  const pathname = usePathname();
  const seg = pathname?.split('/').filter(Boolean)[0] || 'en';
  return seg === 'fr' ? 'fr' : 'en';
}
const withLocale = (loc: string, p: string) => `/${loc}${p}`.replace('//', '/');

export default function AuthActions() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {data: {user}} = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    })();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    router.push(withLocale(locale, '/'));
  };

  if (!email) {
    return (
      <div className="flex items-center gap-3">
        <Link href={withLocale(locale, '/login')} className="text-sm hover:text-blue-600">
          Sign In
        </Link>
        <Link
          href={withLocale(locale, '/register')}
          className="rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:from-blue-500 hover:to-cyan-500"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{email}</span>
      <button
        onClick={signOut}
        className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
      >
        Logout
      </button>
    </div>
  );
}
