import { Link, Outlet } from 'react-router-dom'
import ToastViewport from './ToastViewport'
import { useAuthStore } from '../store/useAuthStore'

export default function Layout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-accent font-display font-bold text-ink">
              B
            </span>
            <span className="font-display font-bold text-lg tracking-tight">
              Bid<span className="text-accent">board</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link to="/" className="text-sm text-muted hover:text-white px-2 py-1 hidden sm:inline">Browse</Link>
            <Link to="/map" className="text-sm text-muted hover:text-white px-2 py-1 hidden sm:inline">Map</Link>
            <Link to="/dashboard" className="text-sm text-muted hover:text-white px-2 py-1 hidden sm:inline">Dashboard</Link>
            <Link to="/sell" className="btn-accent !py-1.5 !px-3 text-sm">Sell a slot</Link>
            {user ? (
              <button onClick={logout} className="text-sm text-muted hover:text-white px-2 py-1 hidden sm:inline" title={user.email}>
                {user.name} · Logout
              </button>
            ) : (
              <Link to="/login" className="text-sm text-muted hover:text-white px-2 py-1 hidden sm:inline">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Bidboard — the auction house for outdoor advertising.
          </span>
          <span>Live auctions powered by a real-time backend.</span>
        </div>
      </footer>

      <ToastViewport />
    </div>
  )
}
