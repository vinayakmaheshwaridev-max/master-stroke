import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function NotFoundPage() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  // Determine back home location based on URL path area
  const isAdminArea = location.pathname.startsWith('/admin')
  const backHomeUrl = isAdminArea 
    ? (isAuthenticated ? '/admin/dashboard' : '/admin/login') 
    : (isAuthenticated ? '/dashboard' : '/')

  return (
    <div className="min-h-screen bg-[#faf8f2] flex flex-col font-sans">
      
      {/* Background ripples (optional optical illusion similar to mockup if needed, but keeping it clean) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Giant 404 & Image Block */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Faint concentric circle background styling from image backdrop */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[500px] h-[500px] rounded-full border border-gray-200"></div>
            <div className="absolute w-[600px] h-[600px] rounded-full border border-gray-100"></div>
            <div className="absolute w-[700px] h-[700px] rounded-full border border-gray-50"></div>
          </div>

          <h1 className="text-[180px] sm:text-[220px] font-black tracking-tighter text-[#e5e5df] leading-none select-none z-10 flex items-center gap-2">
            <span>4</span>
            {/* Center Zero Image cut out perfectly into circle */}
            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl flex-shrink-0 mx-[-10px] z-20 border-[6px] border-[#faf8f2]">
              <img 
                src="/cricket_ball_404.png" 
                alt="Cricket Ball" 
                className="w-full h-full object-cover scale-105"
              />
            </div>
            <span>4</span>
          </h1>
        </div>

        {/* Messaging */}
        <div className="text-center z-10 max-w-lg mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1a1c17] tracking-tight mb-4">
            Out of Bounds
          </h2>
          <p className="text-[#4a4d40] text-lg sm:text-xl leading-relaxed mb-8">
            The page you're looking for has been hit for a massive six. It's currently nowhere to be found on the field of play.
          </p>

          <Link
            to={backHomeUrl}
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#e8e2d4] hover:bg-[#ddd5c4] text-[#69492a] font-bold rounded-full transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>

        {/* Utility Cards */}
        <div className="z-10 grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-xl">
          <Link to={isAdminArea ? "/admin/matches" : "/matches"} className="flex flex-col items-center justify-center p-6 bg-[#f5f1e8] hover:bg-[#efe9dc] transition-colors rounded-3xl group">
            <span className="material-symbols-outlined text-4xl text-[#4a4d40] mb-3 group-hover:scale-110 transition-transform">
              sports_cricket
            </span>
            <span className="text-sm font-semibold text-[#1a1c17]">Matches</span>
          </Link>

          <Link to={isAdminArea ? "/admin/tournament" : "/standings"} className="flex flex-col items-center justify-center p-6 bg-[#f5f1e8] hover:bg-[#efe9dc] transition-colors rounded-3xl group">
            <span className="material-symbols-outlined text-4xl text-[#4a4d40] mb-3 group-hover:scale-110 transition-transform">
              leaderboard
            </span>
            <span className="text-sm font-semibold text-[#1a1c17]">Standings</span>
          </Link>

          <Link to="/info" className="flex flex-col items-center justify-center p-6 bg-[#f5f1e8] hover:bg-[#efe9dc] transition-colors rounded-3xl group">
            <span className="material-symbols-outlined text-4xl text-[#4a4d40] mb-3 group-hover:scale-110 transition-transform">
              help
            </span>
            <span className="text-sm font-semibold text-[#1a1c17]">Support</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-8 flex flex-col sm:flex-row items-center justify-between z-10 border-t border-[#e0d8c8] bg-[#faf8f2]">
        <p className="text-sm text-[#6f7665] font-medium mb-4 sm:mb-0">
          © 2024 Cricket Tournament Platform. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-[#6f7665] font-medium">
          <Link to="/info" className="hover:text-[#4a4d40] transition-colors hover:underline">Privacy Policy</Link>
          <Link to="/info" className="hover:text-[#4a4d40] transition-colors hover:underline">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
