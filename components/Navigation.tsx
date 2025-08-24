'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUser()
    // 监听认证状态变化
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🏒</span>
              <span>HockeyHub</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                
                  href="/dashboard"
                  className={`hover:text-blue-600 transition-colors ${
                    isActive('/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Dashboard
                </a>
                
                  href="/rinks"
                  className={`hover:text-blue-600 transition-colors ${
                    isActive('/rinks') ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Rinks
                </a>
                
                  href="/bookings"
                  className={`hover:text-blue-600 transition-colors ${
                    isActive('/bookings') ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  My Bookings
                </a>
                
                  href="/games"
                  className={`hover:text-blue-600 transition-colors ${
                    isActive('/games') ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Games
                </a>
                
                  href="/clubs"
                  className={`hover:text-blue-600 transition-colors ${
                    isActive('/clubs') ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Clubs
                </a>
              </>
            ) : (
              <>
                <a href="/rinks" className="text-gray-700 hover:text-blue-600">
                  Browse Rinks
                </a>
                <a href="/games" className="text-gray-700 hover:text-blue-600">
                  Games
                </a>
                <a href="/clubs" className="text-gray-700 hover:text-blue-600">
                  Clubs
                </a>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                
                  href="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </a>
                
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {user ? (
              <>
                <a href="/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">Dashboard</a>
                <a href="/rinks" className="block py-2 text-gray-700 hover:text-blue-600">Rinks</a>
                <a href="/bookings" className="block py-2 text-gray-700 hover:text-blue-600">My Bookings</a>
                <a href="/games" className="block py-2 text-gray-700 hover:text-blue-600">Games</a>
                <a href="/clubs" className="block py-2 text-gray-700 hover:text-blue-600">Clubs</a>
                <div className="pt-4 mt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="/rinks" className="block py-2 text-gray-700 hover:text-blue-600">Browse Rinks</a>
                <a href="/games" className="block py-2 text-gray-700 hover:text-blue-600">Games</a>
                <a href="/clubs" className="block py-2 text-gray-700 hover:text-blue-600">Clubs</a>
                <div className="pt-4 mt-4 border-t">
                  <a href="/login" className="block py-2 text-gray-700 hover:text-blue-600">Login</a>
                  <a href="/register" className="block py-2 text-blue-600 font-medium">Sign Up</a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}