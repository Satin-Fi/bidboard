import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthUser {
  id: string
  email: string
  name: string
  verified: boolean
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('bb_token'),
  loading: false,

  init: () => {
    const token = localStorage.getItem('bb_token')
    const raw = localStorage.getItem('bb_user')
    if (token && raw) {
      try { set({ token, user: JSON.parse(raw) }) } catch { /* ignore */ }
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await api.login(email, password)
      localStorage.setItem('bb_token', res.token)
      localStorage.setItem('bb_user', JSON.stringify(res.user))
      set({ token: res.token, user: res.user, loading: false })
    } catch (e: any) {
      set({ loading: false })
      throw new Error(e.message || 'Login failed')
    }
  },

  register: async (email, name, password) => {
    set({ loading: true })
    try {
      const res = await api.register(email, name, password)
      localStorage.setItem('bb_token', res.token)
      localStorage.setItem('bb_user', JSON.stringify(res.user))
      set({ token: res.token, user: res.user, loading: false })
    } catch (e: any) {
      set({ loading: false })
      throw new Error(e.message || 'Registration failed')
    }
  },

  logout: () => {
    localStorage.removeItem('bb_token')
    localStorage.removeItem('bb_user')
    set({ token: null, user: null })
  },
}))
