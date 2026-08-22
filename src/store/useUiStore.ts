import { create } from 'zustand'

export type ToastKind = 'ok' | 'warn' | 'info'
export interface Toast {
  id: number
  text: string
  kind: ToastKind
}

interface UiState {
  toasts: Toast[]
  watchedOnly: boolean
  push: (text: string, kind?: ToastKind) => void
  dismiss: (id: number) => void
  setWatchedOnly: (v: boolean) => void
}

let toastId = 0

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  watchedOnly: false,
  push: (text, kind = 'info') => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, text, kind }] }))
    setTimeout(() => get().dismiss(id), 4200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setWatchedOnly: (v) => set({ watchedOnly: v }),
}))
