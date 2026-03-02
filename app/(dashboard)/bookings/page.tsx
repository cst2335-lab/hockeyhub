// app/(dashboard)/bookings/page.tsx
'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {formatCurrency, formatDate} from '@/lib/utils/format';

/**
 * Bookings list page
 * - Derive locale from pathname and localize internal links.
 * - Require auth: redirect unauthenticated users to /{locale}/login.
 * - Wrap fetchBookings with useCallback and include in useEffect deps.
 */
export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  // Derive locale from the first path segment: /{locale}/...
  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname]);

  // Helper to build a locale-prefixed path
  const withLocale = (p: string) => `/${locale || ''}${p}`.replace('//', '/');

  const fetchBookings = useCallback(async () => {
    const supabase = createClient();

    // Auth check: redirect to localized login when no user
    const {
      data: {user},
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(withLocale('/login'));
      setLoading(false);
      return;
    }

    const {data, error} = await supabase
      .from('bookings')
      .select(
        `
        *,
        rinks (name, address)
      `
      )
      // Show only current user's bookings (keeps intent of "My Bookings")
      .eq('user_id', user.id)
      .order('booking_date', {ascending: true});

    if (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }, [router, locale]); // locale affects redirect target

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-lg shadow p-8 text-center border border-border">
          <p className="text-muted-foreground mb-4">No bookings yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={withLocale(`/bookings/${b.id}`)}
              className="bg-card text-card-foreground rounded-lg shadow p-6 hover:shadow-md transition border border-border"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{b.rinks?.name ?? 'Rink'}</h3>
                  <p className="text-muted-foreground mt-1">
                    📅 {formatDate(b.booking_date)} — {b.start_time} ~ {b.end_time}
                  </p>
                  <p className="text-muted-foreground">{b.rinks?.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Total</div>
                  <div className="font-bold">{formatCurrency(b.total)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
