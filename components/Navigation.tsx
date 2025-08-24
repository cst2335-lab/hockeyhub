'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
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

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-xl font-bold flex items-center gap-2">
            <span>🏒</span>
            <span>HockeyHub</span>
          </a>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <a href="/dashboard" className="hover:text-blue-600">
                  Dashboard
                </a>
                <a href="/rinks" className="hover:text-blue-600">
                  Rinks
                </a>
                <a href="/bookings" className="hover:text-blue-600">
                  My Bookings
                </a>
                <a href="/games" className="hover:text-blue-600">
                  Games
                </a>
                <a href="/clubs" className="hover:text-blue-600">
                  Clubs
                </a>
              </>
            ) : (
              <>
                <a href="/rinks" className="hover:text-blue-600">
                  Browse Rinks
                </a>
                <a href="/games" className="hover:text-blue-600">
                  Games
                </a>
                <a href="/clubs" className="hover:text-blue-600">
                  Clubs
                </a>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="hover:text-blue-600">
                  Login
                </a>
                <a 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}