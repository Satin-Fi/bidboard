import { Link, Outlet, useLocation } from 'react-router-dom'
import ToastViewport from './ToastViewport'
import OutbidModal from './OutbidModal'
import { useBidStore } from '../store/useBidStore'
import { Layers, Plus, ArrowUpRight } from 'lucide-react'

export default function Layout() {
  const openModal = useBidStore((s) => s.openModal)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Leaderboard' },
    { to: '/categories', label: 'Categories' },
    { to: '/activity', label: 'Activity' },
    { to: '/rules', label: 'Rules' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-bg text-[#f3f4f6] selection:bg-coral-500/30 selection:text-coral-200">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-bg/85 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 h-15 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-coral-500 to-coral-600 text-white shadow-sm shadow-coral-500/30 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white group-hover:text-coral-400 transition-colors">
              Bidboard<span className="text-coral-500 font-normal">.app</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-2">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-white/[0.06]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <button
              onClick={() => openModal({ initialAmount: 1 })}
              className="btn-accent !py-1.5 !px-3.5 !text-xs !rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Get Listed</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Minimalist Footer ─────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 mt-20 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-4xl px-4 flex flex-col items-center gap-2.5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-neutral-500">Public attention market where rank = bid.</span>
            <span className="text-neutral-600 hidden sm:inline">·</span>
            <Link to="/rules" className="text-neutral-400 hover:text-white transition-colors">
              Market Rules
            </Link>
            <span className="text-neutral-600 hidden sm:inline">·</span>
            <Link to="/activity" className="text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-0.5">
              Live Stats <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-neutral-600 text-[11px]">
            © {new Date().getFullYear()} Bidboard — Deterministic Pay-to-Rank Leaderboard
          </div>
        </div>
      </footer>

      <OutbidModal />
      <ToastViewport />
    </div>
  )
}
