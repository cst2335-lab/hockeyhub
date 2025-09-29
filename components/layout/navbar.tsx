// components/layout/navbar.tsx
'use client';

import Link from 'next-intl/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Home, Users, MapPin, Trophy, User as UserIcon, LogOut } from 'lucide-react';
import NotificationBell from '@/components/notifications/notification-bell';
import LocaleSwitcher from '@/components/LocaleSwitcher'; // Language switcher
import { useTranslations } from 'next-intl';

export default function Navbar() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // i18n translators
  const tNav = useTranslations('nav');
  const tActions = useTranslations('actions');

  useEffect(() => {
    // Fetch current user on mount
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign out then redirect to home
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand (kept as a Link so locale prefix is preserved) */}
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HockeyHub</span>
          </Link>

          {/* Primary navigation (desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/games" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Home className="h-5 w-5" />
              <span>{tNav('games')}</span>
            </Link>
            <Link href="/clubs" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Users className="h-5 w-5" />
              <span>{tNav('clubs') ?? 'Clubs'}</span>
            </Link>
            <Link href="/rinks" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <MapPin className="h-5 w-5" />
              <span>{tNav('rinks')}</span>
            </Link>
          </div>

          {/* Right side: language switcher + auth area */}
          <div className="flex items-center gap-4">
            {/* Language switcher (works on any page, keeps current path) */}
            <LocaleSwitcher />

            {user ? (
              <>
                {/* Notification bell */}
                <NotificationBell />

                {/* Post Game button */}
                <Link
                  href="/games/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {tActions('join') /* or create a dedicated 'post' key if you prefer */}
                </Link>

                {/* Profile dropdown (simple hover group) */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Profile menu">
                    <UserIcon className="h-6 w-6 text-gray-700" />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      {tNav('profile') ?? 'My Profile'}
                    </Link>
                    <Link
                      href="/notifications"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition md:hidden"
                    >
                      {tNav('notifications') ?? 'Notifications'}
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        {/* Keep text short for FR; add a 'logout' key to messages when convenient */}
                        {tNav('logout') ?? 'Logout'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-gray-700 px-4 py-2 hover:text-blue-600 transition"
                >
                  {tNav('login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {tNav('signup') ?? 'Sign Up'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
