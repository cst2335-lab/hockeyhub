// components/layout/navigation.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, MapPin, Users, Bell, User, Menu, X,
  Trophy, LogOut, Settings, ChevronDown
} from 'lucide-react';

// Use relative imports to avoid '@' alias issues
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import LocaleSwitcher from '../LocaleSwitcher';

import { createClient } from '@supabase/supabase-js';

// Create Supabase client (public anon)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname() || '/en'; // fallback to /en if undefined

  // Derive current locale from the first non-empty segment (e.g. /en/..., /fr/...)
  const locale = useMemo(() => {
    const seg = pathname.split('/').filter(Boolean)[0];
    return seg === 'fr' ? 'fr' : 'en';
  }, [pathname]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Fetch session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Simple scroll shadow behavior
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper: is the given path "active"? Use startsWith to also cover subroutes
  const isActive = (path: string) => pathname.startsWith(path);

  // Navigation items (all prefixed with current locale)
  const navItems = [
    { path: `/${locale}/dashboard`, label: 'Dashboard', icon: Home },
    { path: `/${locale}/games`, label: 'Find Games', icon: Calendar },
    { path: `/${locale}/rinks`, label: 'Ice Rinks', icon: MapPin },
    { path: `/${locale}/clubs`, label: 'Clubs', icon: Users }
  ];

  // Sign-out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg' : 'bg-white/70 backdrop-blur-md'
        }`}
        aria-label="Global Navigation"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                aria-label="HockeyHub Home"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                HockeyHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={item.path} aria-current={active ? 'page' : undefined}>
                    <Button
                      variant={active ? 'default' : 'ghost'}
                      className={`relative px-4 py-2 transition-all ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                        />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher (your component) */}
              <LocaleSwitcher />

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    aria-label={`${notifications} unread notifications`}
                  >
                    {notifications}
                  </motion.span>
                )}
              </Button>

              {/* User menu */}
              {user ? (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </Button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <Link href={`/${locale}/profile`}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Link href={`/${locale}/settings`}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <hr className="my-2" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href={`/${locale}/login`}>
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href={`/${locale}/register`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 bg-white shadow-xl z-40 md:hidden"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={active ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer below fixed nav */}
      <div className="h-16" />
    </>
  );
}
