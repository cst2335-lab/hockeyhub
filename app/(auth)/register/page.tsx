'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Two-step registration
  
  // Step 1: Basic info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Step 2: Hockey profile
  const [profile, setProfile] = useState({
    age_group: '',
    skill_level: '',
    position: '',
    area: '',
    years_playing: 0,
    phone: '',
    jersey_number: '',
    preferred_shot: ''
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setError('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with hockey details
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            age_group: profile.age_group,
            skill_level: profile.skill_level,
            position: profile.position,
            area: profile.area,
            years_playing: profile.years_playing,
            phone: profile.phone,
            jersey_number: profile.jersey_number,
            preferred_shot: profile.preferred_shot
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your GoGoHockey account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {step} of 2: {step === 1 ? 'Basic Information' : 'Hockey Profile'}
          </p>
        </div>

        {step === 1 ? (
          // Step 1: Basic Information
          <form className="mt-8 space-y-6" onSubmit={handleStep1Submit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="full-name" className="sr-only">Full Name</label>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to Hockey Profile
            </button>
          </form>
        ) : (
          // Step 2: Hockey Profile
          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              {/* Age Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Age Group *</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.age_group}
                  onChange={(e) => setProfile({...profile, age_group: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="U7">U7</option>
                  <option value="U9">U9</option>
                  <option value="U11">U11</option>
                  <option value="U13">U13</option>
                  <option value="U15">U15</option>
                  <option value="U18">U18</option>
                  <option value="Adult">Adult</option>
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Skill Level *</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.skill_level}
                  onChange={(e) => setProfile({...profile, skill_level: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="AAA">AAA</option>
                  <option value="AA">AA</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="House League">House League</option>
                  <option value="Beginner">Beginner</option>
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Position *</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.position}
                  onChange={(e) => setProfile({...profile, position: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="Forward">Forward</option>
                  <option value="Defense">Defense</option>
                  <option value="Goalie">Goalie</option>
                  <option value="Any">Any Position</option>
                </select>
              </div>

              {/* Preferred Shot */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Shoots</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={profile.preferred_shot}
                  onChange={(e) => setProfile({...profile, preferred_shot: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                </select>
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Area/Location *</label>
              <select
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={profile.area}
                onChange={(e) => setProfile({...profile, area: e.target.value})}
              >
                <option value="">Select your area</option>
                <option value="Downtown Ottawa">Downtown Ottawa</option>
                <option value="Ottawa East">Ottawa East</option>
                <option value="Ottawa West">Ottawa West</option>
                <option value="Ottawa South">Ottawa South</option>
                <option value="Kanata">Kanata</option>
                <option value="Nepean">Nepean</option>
                <option value="Orleans">Orleans</option>
                <option value="Gloucester">Gloucester</option>
                <option value="Barrhaven">Barrhaven</option>
                <option value="Stittsville">Stittsville</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Years Playing */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Years Playing</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={profile.years_playing}
                  onChange={(e) => setProfile({...profile, years_playing: parseInt(e.target.value) || 0})}
                />
              </div>

              {/* Jersey Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Jersey #</label>
                <input
                  type="text"
                  maxLength={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={profile.jersey_number}
                  onChange={(e) => setProfile({...profile, jersey_number: e.target.value})}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="(613) 555-0100"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isLoading ? 'Creating...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}