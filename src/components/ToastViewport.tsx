import { useUiStore } from '../store/useUiStore'

const kindStyles: Record<string, string> = {
  ok: 'border-accent-2/40 text-accent-2',
  warn: 'border-amber-400/40 text-amber-300',
  info: 'border-white/15 text-white',
}

export default function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismiss)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(92vw,320px)]">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`card !rounded-xl border px-4 py-3 text-left text-sm animate-[fadeIn_.2s_ease] ${kindStyles[t.kind]}`}
        >
          {t.text}
        </button>
      ))}
    </div>
  )
}
