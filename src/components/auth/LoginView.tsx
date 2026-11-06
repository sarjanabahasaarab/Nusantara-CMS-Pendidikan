import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { SiteSetting, ActiveNav, RoleName } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface LoginViewProps {
  settings: SiteSetting;
  onNavigate: (nav: ActiveNav) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings, onNavigate }) => {
  const { login, switchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Mohon masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      onNavigate('admin-dashboard');
    } else {
      setErrorMessage(result.error || 'Autentikasi gagal.');
    }
  };

  const handleQuickDemoLogin = (role: RoleName, demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    switchUser(role);
    onNavigate('admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to public site */}
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Sekolah</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Nusantara Education CMS
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sistem Masuk Tunggal (SSO) Portal Pendidikan {settings.siteName}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-8 space-y-6">
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="nama@nusantara.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember session */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Ingat sesi login di perangkat ini
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full justify-center h-10 font-bold"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Quick Demo Switcher (Sangat memudahkan penguji mencoba berbagai role) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Uji Coba Cepat Hak Akses Multi-Role:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('SUPER_ADMIN', 'admin@example.com', 'AdminNusantara123!')}
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-left border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <span className="font-bold block">Super Admin</span>
                  <span className="text-[10px] opacity-75">admin@example.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('KEPALA_SEKOLAH', 'kepsek@nusantara.sch.id', 'Kepsek123!')}
                  className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-left border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  <span className="font-bold block">Kepala Sekolah</span>
                  <span className="text-[10px] opacity-75">kepsek@nusantara...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('GURU', 'guru@nusantara.sch.id', 'Guru123!')}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-left border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <span className="font-bold block">Guru Pendidik</span>
                  <span className="text-[10px] opacity-75">guru@nusantara...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('SISWA', 'siswa@nusantara.sch.id', 'Siswa123!')}
                  className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-left border border-amber-200 dark:border-amber-800 transition-colors"
                >
                  <span className="font-bold block">Siswa (Limited)</span>
                  <span className="text-[10px] opacity-75">Uji batasan 403</span>
                </button>
              </div>
            </div>

            {/* Self-service Institution Registration Link (Phase 4 Multi-Tenant) */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onNavigate('register-institution')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                🏫 Ingin mendaftarkan sekolah atau kampus Anda? <span className="underline">Daftar Institusi Baru</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security watermark */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Koneksi aman terenkripsi SSL 256-bit & Proteksi Multi-Tenant</span>
        </div>
      </div>
    </div>
  );
};
