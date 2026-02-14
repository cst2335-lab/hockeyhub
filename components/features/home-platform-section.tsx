'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { PlayCircle, Calendar, Users } from 'lucide-react';

export function HomePlatformSection() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const withLocale = (path: string) => `/${locale}${path}`.replace(/\/{2,}/g, '/');

  const pillars = [
    {
      key: 'findGames' as const,
      href: withLocale('/games'),
      icon: PlayCircle,
    },
    {
      key: 'bookIce' as const,
      href: withLocale('/rinks'),
      icon: Calendar,
    },
    {
      key: 'connectClubs' as const,
      href: withLocale('/clubs'),
      icon: Users,
    },
  ] as const;

  return (
    <section className="py-16 md:py-24 bg-muted/40 dark:bg-slate-900/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('platformHeadline')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('platformSubline')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="group block p-6 rounded-xl border border-border bg-card hover:border-gogo-secondary hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gogo-primary/10 text-gogo-primary group-hover:bg-gogo-secondary/20 group-hover:text-gogo-secondary transition-colors">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold text-foreground">
                  {t(`${key}Title`)}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`${key}Desc`)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
