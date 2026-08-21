import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast-provider'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'DEMO JR-PROJECT',
    template: '%s | DEMO JR-PROJECT',
  },
  description: 'Platform monitoring data kecelakaan lalu lintas JR-PROJECT dalam tahap pengembangan.',
  generator: 'Next.js',
  applicationName: 'DEMO JR-PROJECT',
  openGraph: {
    title: 'DEMO JR-PROJECT',
    description: 'Platform monitoring data kecelakaan lalu lintas JR-PROJECT dalam tahap pengembangan.',
    siteName: 'DEMO JR-PROJECT',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'DEMO JR-PROJECT',
    description: 'Platform monitoring data kecelakaan lalu lintas JR-PROJECT dalam tahap pengembangan.',
  },
}
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#f8fafc', userScalable: false }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="bg-background">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
