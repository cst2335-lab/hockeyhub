import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Params = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const title = isFr ? 'Clubs | GoGoHockey' : 'Clubs | GoGoHockey';
  const description = isFr
    ? 'Trouver et gérer les clubs de hockey sur GoGoHockey à Ottawa.'
    : 'Find and manage hockey clubs on GoGoHockey in Ottawa.';
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default function ClubsSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
