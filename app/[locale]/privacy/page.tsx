import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('privacyPage');
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');
  const dateStr = new Date().toLocaleDateString(locale === 'fr' ? 'fr-CA' : 'en-CA');

  return (
    <main className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mb-6">{t('lastUpdated', { date: dateStr })}</p>
          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">{t('intro')}</p>
            <section>
              <h2 className="text-xl font-semibold mt-6 text-foreground">{t('collectTitle')}</h2>
              <p className="mt-2">{t('collectBody')}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mt-6 text-foreground">{t('useTitle')}</h2>
              <p className="mt-2">{t('useBody')}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mt-6 text-foreground">{t('contactTitle')}</h2>
              <p className="mt-2">{t('contactBody')}</p>
            </section>
          </div>
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
