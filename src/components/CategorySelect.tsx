import { useState, useRef, useEffect } from 'react'
import { CATEGORIES_LIST } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { ChevronDown, Check } from 'lucide-react'

interface CategorySelectProps {
  value: string
  onChange: (slug: string) => void
  includeAll?: boolean
  className?: string
  placeholder?: string
}

export default function CategorySelect({
  value,
  onChange,
  includeAll = false,
  className = '',
  placeholder = 'Choose category',
}: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const categories = includeAll
    ? CATEGORIES_LIST
    : CATEGORIES_LIST.filter((c) => c.slug !== 'all')

  const selectedCategory = CATEGORIES_LIST.find((c) => c.slug === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 hover:border-white/20 text-xs font-medium text-white transition-colors text-left outline-none"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedCategory && selectedCategory.slug !== 'all' ? (
            <>
              <CategoryIcon name={selectedCategory.slug} className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
              <span className="truncate">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-neutral-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 flex-shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Popover */}
      {open && (
        <div className="absolute right-0 left-0 sm:left-auto top-full mt-1.5 z-50 min-w-full sm:min-w-[240px] max-h-72 overflow-y-auto rounded-xl bg-[#13151c] border border-white/12 shadow-2xl p-1.5 no-scrollbar backdrop-blur-xl animate-fade-in">
          {categories.map((cat) => {
            const isSelected = value === cat.slug
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  onChange(cat.slug)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CategoryIcon
                    name={cat.slug}
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isSelected ? 'text-coral-400' : 'text-neutral-400'
                    }`}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-coral-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
