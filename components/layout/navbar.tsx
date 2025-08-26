// components/layout/navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Home, Users, MapPin, Trophy, User as UserIcon, LogOut, Bell } from 'lucide-react';
import NotificationBell from '@/components/notifications/notification-bell';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HockeyHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/games" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Home className="h-5 w-5" />
              <span>Games</span>
            </Link>
            <Link href="/clubs" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Users className="h-5 w-5" />
              <span>Clubs</span>
            </Link>
            <Link href="/rinks" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <MapPin className="h-5 w-5" />
              <span>Rinks</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* Post Game Button */}
                <Link
                  href="/games/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Post Game
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition">
                    <UserIcon className="h-6 w-6 text-gray-700" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/notifications"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition md:hidden"
                    >
                      Notifications
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
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
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}