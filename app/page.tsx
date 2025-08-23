export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">🏒 HockeyHub</span>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect Ottawa's Youth Hockey Community
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Simplify game scheduling, find available rinks, and connect with local clubs.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
            >
              Get Started Free →
            </a>
            <a 
              href="/games"
              className="border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50"
            >
              Browse Games
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Game Matchmaking</h3>
            <p className="text-gray-600">
              Post and respond to friendly game invitations.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rink Directory</h3>
            <p className="text-gray-600">
              Browse all Ottawa ice rinks with availability.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Club Profiles</h3>
            <p className="text-gray-600">
              Create and manage your club's profile.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}