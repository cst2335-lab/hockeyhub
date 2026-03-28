import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { serializeJsonLd } from '@/lib/utils/json-ld';
import { normalizeHttpUrl, sanitizePlainText } from '@/lib/utils/sanitize';

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
  const name = sanitizePlainText(rink.name ?? '') || 'Ice Rink';
  const address = sanitizePlainText(rink.address ?? '');
  const phone = sanitizePlainText(rink.phone ?? '');
  const bookingUrl = normalizeHttpUrl(rink.booking_url, 2000);

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://schema.org/SportsActivityLocation',
    name,
    ...(address ? { address } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(bookingUrl ? { url: bookingUrl } : {}),
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

  const safeName = sanitizePlainText(rink.name ?? '').slice(0, 120) || 'Ice Rink';
  const safeAddress = sanitizePlainText(rink.address ?? '').slice(0, 200);
  const title = `${safeName} | Book Ice Time | GoGoHockey`;
  const description =
    safeAddress
      ? `Book ice time at ${safeName} in Ottawa. Location: ${safeAddress}.`
      : `Book ice time at ${safeName} in Ottawa.`;
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
  const rinkJsonLd = rink ? serializeJsonLd(buildRinkJsonLd(rink)) : null;

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
