import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Params = { locale: string; rinkId: string };
type RinkSeoRow = {
  name: string | null;
  address: string | null;
  phone: string | null;
  booking_url: string | null;
  hourly_rate: number | null;
};

async function getRinkSeoRow(rinkId: string): Promise<RinkSeoRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rinks')
    .select('name, address, phone, booking_url, hourly_rate')
    .eq('id', rinkId)
    .maybeSingle();

  if (error || !data) return null;
  return data as RinkSeoRow;
}

function buildRinkJsonLd(rink: RinkSeoRow) {
  const name = rink.name || 'Ice Rink';
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://schema.org/SportsActivityLocation',
    name,
    ...(rink.address ? { address: rink.address } : {}),
    ...(rink.phone ? { telephone: rink.phone } : {}),
    ...(rink.booking_url ? { url: rink.booking_url } : {}),
    ...(typeof rink.hourly_rate === 'number' ? { priceRange: `$${rink.hourly_rate}/hour` } : {}),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { rinkId } = await params;
  const rink = await getRinkSeoRow(rinkId);

  if (!rink) {
    return { title: 'Rink Not Found | GoGoHockey' };
  }

  const title = `${rink.name || 'Ice Rink'} | Book Ice Time | GoGoHockey`;
  const description =
    rink.address
      ? `Book ice time at ${rink.name || 'this rink'} in Ottawa. Location: ${rink.address}.`
      : `Book ice time at ${rink.name || 'this rink'} in Ottawa.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function BookRinkLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { rinkId } = await params;
  const rink = await getRinkSeoRow(rinkId);
  const rinkJsonLd = rink ? JSON.stringify(buildRinkJsonLd(rink)) : null;

  return (
    <>
      {rinkJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: rinkJsonLd }}
        />
      )}
      {children}
    </>
  );
}
