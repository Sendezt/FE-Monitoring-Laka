'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { authApi } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'
import { Eye, EyeOff, Shield, Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, init } = useAuthStore()
  const { error: showError } = useToast()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    init()
  }, [init])

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    setLoading(true)
    try {
      const res = await authApi.login(username.trim(), password)
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user)
        router.replace('/')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login gagal. Periksa username dan password Anda.'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f9fb] p-4 sm:p-6 md:p-8">
      {/* Main Container */}
      <main className="w-full max-w-4xl h-auto md:h-[500px] flex flex-col md:flex-row rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-white">

        {/* Left Panel */}
        <section
          aria-label="Information panel"
          className="hidden md:flex w-1/2 bg-[#154e7d] relative overflow-hidden text-white p-8 flex-col justify-between"
        >
          {/* Concentric Circle Pattern Simulation */}
          <div className="absolute top-[-20%] left-[30%] w-[120%] h-[140%] rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[10%] w-[80%] h-[100%] rounded-full border border-white/10 pointer-events-none" />

          {/* Top Branding */}
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-10 h-10 bg-white text-[#154e7d] rounded-full flex items-center justify-center font-bold text-base select-none">
              JR
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">PT Jasa Raharja</h1>
              <p className="text-xs opacity-90">(Persero)</p>
            </div>
          </div>

          {/* Main Info Content */}
          <div className="z-10 my-auto">
            <Shield className="w-9 h-9 mb-4 text-white" strokeWidth={2} />
            <h2 className="text-xl font-bold mb-3 leading-snug">Sistem informasi data kecelakaan</h2>
            <p className="text-xs opacity-90 leading-relaxed max-w-xs">
              Input dan monitoring data kecelakaan lalu lintas harian secara terpusat dan akurat.
            </p>
          </div>

          {/* Footer Info */}
          <div className="z-10 text-[11px] opacity-80">
            Utama dalam perlindungan, prima dalam pelayanan.
          </div>
        </section>

        {/* Right Panel (Login Form) */}
        <section
          aria-label="Login form"
          className="w-full md:w-1/2 bg-white text-slate-900 p-6 sm:p-8 md:p-10 flex flex-col justify-center"
        >
          <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-xl md:text-2xl font-bold mb-1.5 text-slate-900">Masuk ke akun anda</h2>
              <p className="text-slate-500 text-xs">Khusus untuk petugas internal Jasa Raharja.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="username">
                  NIP / username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan NIP atau username"
                  required
                  disabled={loading}
                  className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="password">
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    disabled={loading}
                    className="w-full bg-white border border-slate-300 rounded-md pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-3.5 w-3.5 bg-white border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label className="ml-2 block text-slate-600 cursor-pointer select-none" htmlFor="remember-me">
                    Ingat saya
                  </label>
                </div>
                <a className="font-medium text-[#005691] hover:text-blue-800" href="#">
                  Lupa kata sandi?
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#005691] hover:bg-[#004b80] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-6 flex items-center justify-center text-[11px] text-slate-400">
              <Lock className="w-3 h-3 mr-1.5" />
              Akses dan aktivitas login tercatat oleh sistem.
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
