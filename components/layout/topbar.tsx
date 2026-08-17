'use client'

import { useEffect, useState } from 'react'
import { Bell, ChevronRight, Menu, Moon, Sun } from 'lucide-react'

export function Topbar({ title, eyebrow, onMenu }: { title: string; eyebrow: string; onMenu: () => void }) {
  const [darkMode, setDarkMode] = useState(false)
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('si-laka-theme')
    const isDark = savedTheme === 'dark'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])
  function toggleTheme() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    window.localStorage.setItem('si-laka-theme', next ? 'dark' : 'light')
  }
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/95 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button className="text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer" onClick={onMenu} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        {/* Breadcrumb */}
        {eyebrow && title && (
          <nav className="hidden items-center gap-1.5 sm:flex" aria-label="Breadcrumb">
            <span className="text-sm text-muted-foreground/70">{eyebrow}</span>
            <ChevronRight size={13} className="text-muted-foreground/40" />
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-md border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:cursor-pointer" onClick={toggleTheme} aria-label={darkMode ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="relative rounded-md border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground hover:cursor-pointer" aria-label="Notifikasi">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  )
}
