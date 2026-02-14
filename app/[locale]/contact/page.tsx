import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('contactPage');
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

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
