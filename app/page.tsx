export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏒</span>
            <span className="text-xl font-bold">HockeyHub</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a href="/games" className="text-gray-600 hover:text-gray-900">
              Browse Games
            </a>
            <a href="/login" className="text-gray-600 hover:text-gray-900">
              Sign In
            </a>
            <a 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </a>
          </div>
          {/* Mobile menu */}
          <div className="sm:hidden flex items-center gap-2">
            <a href="/login" className="text-gray-600 text-sm">
              Login
            </a>
            <a 
              href="/register" 
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Start
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            Connect Ottawa's Youth Hockey Community
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Simplify game scheduling, find available rinks, and connect with local clubs. 
            The all-in-one platform for youth hockey in Ottawa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register"
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              Get Started Free <span>→</span>
            </a>
            <a 
              href="/games"
              className="border border-gray-300 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-50"
            >
              Browse Games
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">200+</div>
              <div className="text-sm text-gray-600">Youth Clubs</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">5</div>
              <div className="text-sm text-gray-600">Ice Rinks</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-sm text-gray-600">Players</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Everything You Need for Youth Hockey
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Game Matchmaking</h3>
            <p className="text-gray-600">
              Post and respond to friendly game invitations. Find the perfect opponent for your team.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rink Directory</h3>
            <p className="text-gray-600">
              Browse all Ottawa ice rinks with real-time availability and pricing information.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Club Profiles</h3>
            <p className="text-gray-600">
              Create and manage your club's profile. Build your reputation in the community.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
            <p className="text-gray-600">
              Schedule games with just a few clicks. No more endless emails and phone calls.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">For Everyone</h3>
            <p className="text-gray-600">
              Parents, players, coaches, and club managers - everyone stays connected.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Clubs</h3>
            <p className="text-gray-600">
              All clubs are verified to ensure safe and legitimate game opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Join Ottawa's Hockey Community?
          </h2>
          <p className="text-lg mb-8 text-gray-300">
            Start scheduling games in minutes, not hours.
          </p>
          <a 
            href="/register"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Platform</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><a href="/games" className="hover:text-gray-900">Browse Games</a></li>
                <li><a href="/rinks" className="hover:text-gray-900">Ice Rinks</a></li>
                <li><a href="/clubs" className="hover:text-gray-900">Clubs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Account</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><a href="/register" className="hover:text-gray-900">Sign Up</a></li>
                <li><a href="/login" className="hover:text-gray-900">Login</a></li>
                <li><a href="/profile" className="hover:text-gray-900">Profile</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Connect</h4>
              <p className="text-sm text-gray-600">
                Ottawa, Ontario<br />
                info@hockeyhub.ca<br />
                613-555-0100
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
            <p>© 2025 HockeyHub. Connecting Ottawa's youth hockey community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}