'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'

export interface SearchableOption {
  id: number | string
  nama: string
}

interface SearchableSelectProps {
  options: SearchableOption[]
  value: number | string | null | undefined
  onChange: (id: number | null) => void
  placeholder?: string
  disabled?: boolean
  /** true → beri gaya "belum terpetakan" (border kuning) */
  invalid?: boolean
  /** true → tampilkan tombol clear untuk mengosongkan pilihan */
  clearable?: boolean
  className?: string
  emptyText?: string
  id?: string
}

/**
 * Dropdown dengan pencarian (autocomplete). Menampilkan input teks untuk
 * memfilter opsi berdasarkan nama, keyboard-friendly (panah, enter, esc).
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  disabled = false,
  invalid = false,
  clearable = true,
  className = '',
  emptyText = 'Tidak ada hasil',
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = useMemo(
    () => options.find((o) => String(o.id) === String(value ?? '')),
    [options, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.nama.toLowerCase().includes(q))
  }, [options, query])

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // Fokus ke input saat buka
  useEffect(() => {
    if (open) {
      setActiveIdx(0)
      const t = setTimeout(() => inputRef.current?.focus(), 10)
      return () => clearTimeout(t)
    }
  }, [open])

  // Scroll opsi aktif agar terlihat
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open])

  const commit = (opt: SearchableOption) => {
    onChange(typeof opt.id === 'number' ? opt.id : Number(opt.id))
    setOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[activeIdx]
      if (opt) commit(opt)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const base = `flex w-full items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-left text-[13px] transition-colors
    focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed
    ${invalid ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-border/80'}`

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={base}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`flex-1 truncate ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
          {selected ? selected.nama : placeholder}
        </span>
        {clearable && selected && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Kosongkan"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="shrink-0 rounded p-0.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X size={13} />
          </span>
        )}
        <ChevronDown size={14} className={`shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-[200px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border/60 px-2.5 py-2">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIdx(0) }}
              onKeyDown={handleKeyDown}
              placeholder="Cari..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul ref={listRef} className="max-h-56 overflow-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-muted-foreground">{emptyText}</li>
            ) : (
              filtered.map((o, i) => {
                const isSel = String(o.id) === String(value ?? '')
                return (
                  <li
                    key={o.id}
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => commit(o)}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[13px]
                      ${i === activeIdx ? 'bg-primary/10 text-foreground' : 'text-foreground/90'}`}
                  >
                    <span className="flex-1 truncate">{o.nama}</span>
                    {isSel && <Check size={13} className="shrink-0 text-primary" />}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
