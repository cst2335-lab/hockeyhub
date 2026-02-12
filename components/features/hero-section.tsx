'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, Calendar, MapPin, Users, PlayCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HeroSection() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const withLocale = (path: string) => `/${locale}${path}`.replace(/\/{2,}/g, '/');

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

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
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

          {/* Animated subtitle */}
          <div className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-10 h-12 font-medium">
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

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-sky-100/90 mb-10 max-w-2xl mx-auto"
          >
            Ottawa&apos;s premier platform for organizing hockey games and booking ice time. 
            Join thousands of players already on the ice!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link href={withLocale('/games')}>
              <Button
                size="xl"
                className="group px-8 py-6 text-lg font-semibold bg-white text-gogo-dark hover:bg-gray-100 shadow-lg focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <span className="flex items-center gap-2">
                  Find Games Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            <Link href={withLocale('/register')}>
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-gogo-secondary text-white backdrop-blur-sm hover:bg-gogo-secondary hover:text-gogo-dark hover:border-gogo-secondary px-8 py-6 text-lg focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2"
              >
                <PlayCircle className="mr-2" />
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sky-100/95"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">2,000+</span>
              <span>Active Players</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">54</span>
              <span>Ice Rinks</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">500+</span>
              <span>Games/Month</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.9</span>
              <span>Rating</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white">
          <path d="M0,64 C480,140 960,0 1440,64 L1440,120 L0,120 Z"></path>
        </svg>
      </div>
    </section>
  );
}