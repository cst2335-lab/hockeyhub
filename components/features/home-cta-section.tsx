'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

/**
 * Figma: "Ready To Get GO!GO!GO!" full-width blue CTA banner
 */
export function HomeCTASection() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const withLocale = (path: string) => `/${locale}${path}`.replace(/\/{2,}/g, '/');

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-gogo-dark via-gogo-primary to-gogo-secondary">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('readyCTA')}
          </h2>
          <p className="text-lg text-white/90 mb-8">
            {t('readyCTADesc')}
          </p>
          <Link href={withLocale('/register')}>
            <Button
              size="xl"
              className="group px-10 py-6 text-lg font-semibold bg-white text-gogo-dark hover:bg-gray-100 shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gogo-primary"
            >
              <span className="flex items-center gap-2">
                {t('readyCTAButton')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
