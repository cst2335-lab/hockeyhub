'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, Calendar, MapPin, Users, PlayCircle, Star, LayoutDashboard, Search, UserCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Container } from '@/components/ui/container';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function HeroSection() {
  const params = useParams();
  const t = useTranslations('hero');
  const tActions = useTranslations('actions');
  const locale = (params?.locale as string) || 'en';
  const withLocale = (path: string) => `/${locale}${path}`.replace(/\/{2,}/g, '/');
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
    })();
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    window.location.href = withLocale(q ? `/games?q=${encodeURIComponent(q)}` : '/games');
  }, [searchQuery, withLocale]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gogo-dark via-gogo-primary to-gogo-secondary">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <motion.div
          animate={{ rotate: 360, x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 right-20 w-28 h-28 rounded-full bg-gogo-secondary/20"
        />
        <motion.div
          animate={{ rotate: -360, x: [0, -80, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 left-20 w-36 h-36 rounded-full bg-gogo-secondary/15"
        />
      </div>

      {/* Main content - Salient-style inner container spacing */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto pt-20 pb-16 lg:pt-32"
        >
          {/* GG Logo - bright blue */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            <Logo size="lg" showText={true} light className="justify-center" />
          </motion.div>

          {/* Figma headline — main value prop */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold mb-3 max-w-3xl mx-auto"
          >
            {t('headline')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium mb-6 max-w-2xl mx-auto"
          >
            {t('tagline')}
          </motion.p>

          {/* Figma: Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto mb-8"
          >
            <div className="relative flex rounded-xl overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:ring-inset"
                aria-label={t('searchPlaceholder')}
              />
              <button
                type="submit"
                className="px-5 py-3 bg-gogo-primary text-white font-semibold hover:bg-gogo-dark transition-colors shrink-0"
              >
                <Search className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">{tActions('search')}</span>
              </button>
            </div>
          </motion.form>

          {/* Animated subtitle */}
          <div className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 h-10 font-medium">
            <TypeAnimation
              sequence={[
                'Find Your Next Game',
                2000,
                'Book Premium Ice Time',
                2000,
                'Connect with Local Players',
                2000,
                'Build Your Hockey Community',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          {/* Who it's for — audience clarity */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-lg text-sky-100/85 mb-10 max-w-xl mx-auto"
          >
            {t('whoItFor')}
          </motion.p>

          {/* CTA Buttons - switch by login state */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            {user ? (
              <>
                <Link href={withLocale('/dashboard')} aria-label={t('goToDashboard')}>
                  <Button
                    size="xl"
                    className="group px-8 py-6 text-lg font-semibold bg-card text-gogo-dark hover:bg-muted shadow-lg focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      {t('goToDashboard')}
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Link href={withLocale('/games')} aria-label={t('findGamesNow')}>
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-2 border-gogo-secondary bg-white/95 text-gogo-dark backdrop-blur-sm hover:bg-gogo-secondary hover:text-gogo-dark hover:border-gogo-secondary px-8 py-6 text-lg font-semibold focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2"
                  >
                    <PlayCircle className="mr-2" />
                    {t('findGamesNow')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={withLocale('/games')} aria-label={t('findGamesNow')}>
                  <Button
                    size="xl"
                    className="group px-8 py-6 text-lg font-semibold bg-card text-gogo-dark hover:bg-muted shadow-lg focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <span className="flex items-center gap-2">
                      {t('findGamesNow')}
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Link href={withLocale('/register')} aria-label={t('getStartedFree')}>
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-2 border-gogo-secondary bg-white/95 text-gogo-dark backdrop-blur-sm hover:bg-gogo-secondary hover:text-gogo-dark hover:border-gogo-secondary px-8 py-6 text-lg font-semibold focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2"
                  >
                    <PlayCircle className="mr-2" />
                    {t('getStartedFree')}
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Figma: Stats - Players, Coaches, Officials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sky-100/95"
          >
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span className="font-bold text-xl">2,000+</span>
              <span>{t('statsPlayers')}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCircle className="w-6 h-6" />
              <span className="font-bold text-xl">500+</span>
              <span>{t('statsCoaches')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6" />
              <span className="font-bold text-xl">200+</span>
              <span>{t('statsOfficials')}</span>
            </div>
          </motion.div>
        </motion.div>
        </Container>
      </div>
    </section>
  );
}