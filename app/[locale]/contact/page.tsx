import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';

type ContactSearchParams = {
  topic?: string | string[];
  rinkId?: string | string[];
  rinkName?: string | string[];
  address?: string | string[];
  city?: string | string[];
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ContactSearchParams>;
};

function pickSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const t = await getTranslations({ locale, namespace: 'contactPage' });
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');
  const topic = pickSearchParam(resolvedSearch.topic);
  const isRinkCorrection = topic === 'rink-correction';
  const rinkId = pickSearchParam(resolvedSearch.rinkId);
  const rinkName = pickSearchParam(resolvedSearch.rinkName);
  const address = pickSearchParam(resolvedSearch.address);
  const city = pickSearchParam(resolvedSearch.city);
  const reportSubject =
    locale === 'fr'
      ? `Correction patinoire: ${rinkName || rinkId || 'N/A'}`
      : `Rink data correction: ${rinkName || rinkId || 'N/A'}`;
  const reportBody =
    locale === 'fr'
      ? [
          'Bonjour équipe GoGoHockey,',
          '',
          'Je souhaite signaler une correction de fiche patinoire :',
          `- ID: ${rinkId || 'N/A'}`,
          `- Nom: ${rinkName || 'N/A'}`,
          `- Adresse: ${address || 'N/A'}`,
          `- Ville: ${city || 'N/A'}`,
          '',
          'Correction proposée :',
          '- ',
          '',
          'Merci !',
        ].join('\n')
      : [
          'Hello GoGoHockey team,',
          '',
          'I would like to report a rink listing correction:',
          `- ID: ${rinkId || 'N/A'}`,
          `- Name: ${rinkName || 'N/A'}`,
          `- Address: ${address || 'N/A'}`,
          `- City: ${city || 'N/A'}`,
          '',
          'Proposed correction:',
          '- ',
          '',
          'Thanks!',
        ].join('\n');
  const reportMailto = `mailto:contact@gogohockey.ca?subject=${encodeURIComponent(reportSubject)}&body=${encodeURIComponent(reportBody)}`;

  return (
    <main className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{t('title')}</h1>
          <p className="text-lg text-muted-foreground mb-6">{t('intro')}</p>
          <div className="rounded-xl border border-border bg-muted dark:bg-slate-800 p-6">
            <p className="font-medium text-foreground mb-2">{t('emailLabel')}</p>
            <a href="mailto:contact@gogohockey.ca" className="text-gogo-primary hover:text-gogo-dark dark:hover:text-sky-300">
              contact@gogohockey.ca
            </a>
            <p className="font-medium text-foreground mt-4 mb-2">{t('locationLabel')}</p>
            <p className="text-muted-foreground">{t('location')}</p>
          </div>
          {isRinkCorrection && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <p className="font-medium text-foreground mb-2">{t('rinkCorrectionTitle')}</p>
              <p className="text-sm text-muted-foreground mb-3">{t('rinkCorrectionHint')}</p>
              <div className="text-sm text-muted-foreground space-y-1 mb-4">
                <p>{t('rinkCorrectionId', { value: rinkId || 'N/A' })}</p>
                <p>{t('rinkCorrectionName', { value: rinkName || 'N/A' })}</p>
                <p>{t('rinkCorrectionAddress', { value: address || 'N/A' })}</p>
              </div>
              <a
                href={reportMailto}
                className="inline-flex items-center rounded-lg bg-gogo-primary px-4 py-2 text-sm font-medium text-white hover:bg-gogo-dark transition"
              >
                {t('rinkCorrectionAction')}
              </a>
            </div>
          )}
          <Link
            href={withLocale('/')}
            className="inline-block mt-8 text-gogo-primary hover:text-gogo-dark dark:hover:text-sky-300 font-medium"
          >
            ← {t('backHome')}
          </Link>
        </div>
      </Container>
    </main>
  );
}
