import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { serializeJsonLd } from '@/lib/utils/json-ld';

type Params = { locale: string; id: string };

type BookingSeoRow = {
  id: string;
  status: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  rinks: { name: string | null; address: string | null } | null;
};

function normalizeRinkEmbed(
  raw: unknown
): { name: string | null; address: string | null } | null {
  if (raw == null) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== 'object') return null;
  const o = row as { name?: string | null; address?: string | null };
  return { name: o.name ?? null, address: o.address ?? null };
}

async function getBookingForOwner(
  bookingId: string,
  userId: string
): Promise<BookingSeoRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('id, status, booking_date, start_time, end_time, rinks(name, address)')
    .eq('id', bookingId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    id: String(row.id),
    status: String(row.status),
    booking_date: String(row.booking_date),
    start_time: row.start_time != null ? String(row.start_time) : null,
    end_time: row.end_time != null ? String(row.end_time) : null,
    rinks: normalizeRinkEmbed(row.rinks),
  };
}

function buildReservationJsonLd(booking: BookingSeoRow) {
  const start =
    booking.booking_date && booking.start_time
      ? `${booking.booking_date}T${String(booking.start_time).slice(0, 5)}:00`
      : undefined;
  const rink = booking.rinks;
  return {
    '@context': 'https://schema.org',
    '@type': 'Reservation',
    reservationId: booking.id,
    reservationStatus:
      booking.status === 'cancelled'
        ? 'https://schema.org/Cancelled'
        : booking.status === 'confirmed'
          ? 'https://schema.org/Confirmed'
          : 'https://schema.org/Pending',
    ...(start ? { startTime: start } : {}),
    reservationFor: {
      '@type': 'SportsActivityLocation',
      name: rink?.name || 'Ice rink',
      ...(rink?.address ? { address: rink.address } : {}),
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      title: 'Booking | GoGoHockey',
      robots: { index: false, follow: false },
    };
  }

  const booking = await getBookingForOwner(id, user.id);
  if (!booking) {
    return {
      title: 'Booking | GoGoHockey',
      robots: { index: false, follow: false },
    };
  }

  const rinkName = booking.rinks?.name || 'Ice rink';
  const title = `Booking · ${rinkName} | GoGoHockey`;
  const description = `Ice booking on ${booking.booking_date} (${booking.status}).`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description },
  };
}

export default async function BookingDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const booking = await getBookingForOwner(id, user.id);
  if (!booking) {
    return <>{children}</>;
  }

  const jsonLd = serializeJsonLd(buildReservationJsonLd(booking));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}
