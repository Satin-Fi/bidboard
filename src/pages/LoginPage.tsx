import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const demoLogin = async (e: string, p: string) => {
    setBusy(true); setError(null)
    try { await login(e, p); navigate('/') }
    catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, name, password)
      navigate('/')
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-7">
        <h1 className="font-display font-bold text-2xl">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-muted mt-1">
          {mode === 'login' ? 'Sign in to bid and sell.' : 'Join Bidboard to bid and list slots.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === 'register' && (
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button className="btn-accent w-full" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          className="text-sm text-muted hover:text-white mt-4 w-full text-center"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'No account? Register' : 'Have an account? Sign in'}
        </button>

        <div className="mt-6 border-t border-white/5 pt-4">
          <p className="text-xs text-muted mb-2">Demo accounts (server auto-seeds):</p>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 !py-1.5 text-xs" onClick={() => demoLogin('owner@bidboard.app', 'password123')}>Owner demo</button>
            <button className="btn-ghost flex-1 !py-1.5 text-xs" onClick={() => demoLogin('buyer@bidboard.app', 'password123')}>Buyer demo</button>
          </div>
        </div>
      </div>
      <Link to="/" className="text-sm text-muted hover:text-white mt-4 inline-block">← Back</Link>
    </div>
  )
}
