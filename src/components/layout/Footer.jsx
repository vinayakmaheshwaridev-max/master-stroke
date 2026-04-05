import { Link } from 'react-router-dom'

export default function Footer({ className = '' }) {
  return (
    <footer className={`w-full py-12 mt-auto border-t border-stone-200/20 bg-stone-50 flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          Privacy Policy
        </Link>
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          Terms of Service
        </Link>
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          Contact Us
        </Link>
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          Support
        </Link>
      </div>
      <p className="text-xs text-zinc-400 tracking-wide">© 2024 Master Stroke Box Cricket. All rights reserved.</p>
    </footer>
  )
}
