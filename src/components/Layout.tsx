import { Link, Outlet } from 'react-router-dom'
import ToastViewport from './ToastViewport'
import OutbidModal from './OutbidModal'
import { useBidStore } from '../store/useBidStore'

export default function Layout() {
  const openModal = useBidStore((s) => s.openModal)

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#f3f4f6]">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0b0c10]/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex items-center justify-center h-7 w-7 rounded-md bg-coral-500 font-display font-black text-white text-base tracking-tighter">
              =
            </span>
            <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-coral-400 transition-colors">
              bidboard<span className="text-coral-500">.app</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
            <Link
              to="/"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              to="/categories"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/activity"
              className="text-neutral-300 hover:text-white transition-colors hidden sm:inline"
            >
              Activity
            </Link>
            <Link
              to="/rules"
              className="text-neutral-300 hover:text-white transition-colors hidden sm:inline"
            >
              Rules
            </Link>
            <button
              onClick={() => openModal()}
              className="btn-accent !py-1.5 !px-3.5 !text-xs !rounded-lg"
            >
              + Get Listed
            </button>
          </nav>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Minimal Footer matching screenshot ─────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 mt-20 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-4xl px-4 flex flex-col items-center gap-2">
          <div>
            Built with ⚡ · Brought to you by{' '}
            <Link to="/" className="text-coral-400 hover:underline">
              bidboard.app
            </Link>{' '}
            ·{' '}
            <Link to="/rules" className="hover:text-white hover:underline">
              Rules
            </Link>{' '}
            ·{' '}
            <Link to="/activity" className="hover:text-white hover:underline">
              Live stats
            </Link>
          </div>
          <div className="text-neutral-500 text-[11px]">
            © {new Date().getFullYear()} Bidboard — The Pay-to-Rank Attention Market
          </div>
        </div>
      </footer>

      <OutbidModal />
      <ToastViewport />
    </div>
  )
}

