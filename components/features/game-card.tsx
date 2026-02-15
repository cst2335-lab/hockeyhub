'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, Calendar, MapPin, Users, PlayCircle, Star, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/img/patterns/grid.svg')] opacity-20"></div>
        
        {/* Floating hockey pucks animation */}
        <motion.div
          animate={{
            rotate: 360,
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-32 h-32 opacity-10"
        >
          <div className="w-full h-full rounded-full bg-white"></div>
        </motion.div>
        
        <motion.div
          animate={{
            rotate: -360,
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-40 h-40 opacity-10"
        >
          <div className="w-full h-full rounded-full bg-blue-400"></div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Logo or icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 inline-block"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Main heading with gradient */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
              GoGoHockey
            </span>
          </h1>

          {/* Animated subtitle */}
          <div className="text-xl sm:text-2xl md:text-3xl text-blue-200 mb-8 h-10">
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
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Ottawa&apos;s premier platform for organizing hockey games and booking ice time. 
            Join thousands of players already on the ice!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href="/games">
              <Button 
                size="xl"
                className="group relative px-8 py-6 text-lg font-semibold overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                <span className="relative flex items-center gap-2">
                  Find Games Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            <Link href="/register">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-blue-400/50 text-blue-300 hover:bg-blue-400/10 px-8 py-6 text-lg"
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
            className="flex flex-wrap items-center justify-center gap-8 text-blue-300"
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