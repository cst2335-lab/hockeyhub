'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState('parent')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    
    // Register user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage('Error: ' + error.message)
      setLoading(false)
      return
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          user_type: userType,
          phone: phone,
          username: email.split('@')[0]
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    setMessage('Registration successful! You can now login.')
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-gray-600">Join the HockeyHub community</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="613-555-0100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                I am a... *
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="parent">Parent</option>
                <option value="player">Player</option>
                <option value="coach">Coach</option>
                <option value="club_manager">Club Manager</option>
              </select>
            </div>
          </div>

          {message && (
            <div className={`text-sm text-center p-2 rounded ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-600' 
                : 'bg-green-50 text-green-600'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}