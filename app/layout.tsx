import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast-provider'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://datalakajr.web.id'),
  title: {
    default: 'SI-LAKA | Sistem Informasi Pencatatan Laporan Kecelakaan',
    template: '%s | SI-LAKA — Jasa Raharja',
  },
  description:
    'SI-LAKA adalah aplikasi internal Jasa Raharja untuk mencatat, memantau, dan mengelola data laporan kecelakaan lalu lintas secara terpusat dan akurat.',
  applicationName: 'SI-LAKA',
  generator: 'Next.js',
  authors: [{ name: 'Jasa Raharja' }],
  creator: 'Jasa Raharja',
  publisher: 'Jasa Raharja',
  keywords: [
    'SI-LAKA',
    'Sistem Informasi Pencatatan Laporan Kecelakaan',
    'Jasa Raharja',
    'laporan kecelakaan',
    'kecelakaan lalu lintas',
    'monitoring laka',
    'data laka lantas',
  ],
  // Aplikasi internal berbasis login — jangan diindeks mesin pencari.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png' }],
  },
  openGraph: {
    title: 'SI-LAKA | Sistem Informasi Pencatatan Laporan Kecelakaan',
    description:
      'Aplikasi internal Jasa Raharja untuk pencatatan dan pengelolaan data laporan kecelakaan lalu lintas secara terpusat.',
    siteName: 'SI-LAKA — Jasa Raharja',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: '/ogImage.jpg', width: 1024, height: 541, alt: 'SI-LAKA — Jasa Raharja' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SI-LAKA | Sistem Informasi Pencatatan Laporan Kecelakaan — Jasa Raharja',
    description:
      'Aplikasi internal Jasa Raharja untuk pencatatan dan pengelolaan data laporan kecelakaan lalu lintas.',
    images: ['/ogImage.jpg'],
  },
}
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#154e7d', userScalable: false }
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
