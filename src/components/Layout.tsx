import { Link, Outlet, useLocation } from 'react-router-dom'
import ToastViewport from './ToastViewport'
import OutbidModal from './OutbidModal'
import { useBidStore } from '../store/useBidStore'
import { ArrowUpRight } from 'lucide-react'

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
      {/* ── Top Header Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-bg/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
          {/* Exact Logo from first commit 9a59854 */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-coral-500 font-display font-bold text-[#0B0F1A] text-lg shadow-sm group-hover:scale-105 transition-transform select-none">
              B
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-coral-400 transition-colors">
              Bid<span className="text-coral-500">board</span>
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
                        ? 'text-white bg-white/[0.08]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <button
              onClick={() => openModal({ initialAmount: 1 })}
              className="btn-accent !py-2 !px-4 !text-xs !font-bold !rounded-xl"
            >
              Get Listed
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
            <Link
              to="/activity"
              className="text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-0.5"
            >
              Live Activity <ArrowUpRight className="w-3 h-3" />
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
