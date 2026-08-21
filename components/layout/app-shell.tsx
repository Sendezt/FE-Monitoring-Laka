'use client'

import { useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { useLayoutStore } from '@/lib/layout-store'

export function AppShell({ children, title = 'Dashboard', eyebrow = 'DEMO JR-PROJECT' }: { children: React.ReactNode; title?: string; eyebrow?: string }) {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useLayoutStore()

  // Close sidebar by default on mobile screens (less than 768px width)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [setSidebarOpen])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-foreground/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup overlay"
        />
      )}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
        <Topbar title={title} eyebrow={eyebrow} onMenu={toggleSidebar} />
        <main className="min-h-[calc(100vh-5rem)] px-4 py-6 md:px-8 md:py-8">{children}</main>
        <footer className="border-t px-4 py-5 text-center text-xs text-muted-foreground md:px-8">
          DEMO JR-PROJECT · Tahap Pengembangan · v0.1.0
        </footer>
      </div>
    </div>
  )
}
