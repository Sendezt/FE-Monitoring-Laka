import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const SILakaShell = AppShell

export function PageHeader({ action }: { title?: string; description?: string; action?: React.ReactNode }) {
  if (!action) return null;
  return (
    <div className="mb-5 flex items-center justify-end animate-fade-in">
      <div className="flex items-center gap-3">
        {action}
      </div>
    </div>
  )
}

export function StatCard({ label, value, note, tone = 'default', icon: Icon }: { label: string; value: string; note: string; tone?: 'default' | 'danger' | 'success'; icon?: LucideIcon }) {
  const badgeColors = tone === 'danger'
    ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
    : tone === 'success'
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
      : 'bg-primary/10 text-primary dark:bg-primary/20';

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <div className={`p-2 rounded-lg ${badgeColors} transition-all duration-300 group-hover:scale-110`}>
            <Icon size={16} />
          </div>
        ) : (
          <span className={`mt-1 size-2 rounded-full ${tone === 'danger' ? 'bg-destructive' : tone === 'success' ? 'bg-emerald-500' : 'bg-primary'}`} />
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">{note}</p>
    </div>
  )
}

export function Button({ children, href, variant = 'primary', onClick, disabled }: { children: React.ReactNode; href?: string; variant?: 'primary' | 'outline' | 'ghost'; onClick?: () => void; disabled?: boolean }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variant === 'primary'
    ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/20'
    : variant === 'outline'
      ? 'border border-border/80 bg-card hover:bg-muted text-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          {i > 0 && <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />}
          <span className={i === items.length - 1 ? 'font-semibold text-foreground' : ''}>
            {item}
          </span>
        </span>
      ))}
    </div>
  )
}

export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground/90">
        {label}
        {required && <span className="ml-1 text-destructive font-bold">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground/80">{hint}</span>}
    </label>
  )
}

export const inputClass = 'w-full rounded-lg border border-border/80 bg-background px-3 py-2.5 text-sm outline-hidden transition duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
export const selectClass = inputClass + ' appearance-none'

