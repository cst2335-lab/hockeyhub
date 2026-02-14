import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('aboutPage');
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  return (
    <main className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{t('title')}</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-muted-foreground">
            <p className="text-lg">{t('intro')}</p>
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
