import React from 'react';
import { ShieldAlert, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { ActiveNav } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface Forbidden403Props {
  onNavigate: (nav: ActiveNav) => void;
  requiredPermission?: string;
}

export const Forbidden403: React.FC<Forbidden403Props> = ({
  onNavigate,
  requiredPermission,
}) => {
  const { user, switchUser } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <Badge variant="danger" size="lg" className="mb-3">
        HTTP 403 — Akses Ditolak
      </Badge>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white max-w-md">
        Anda Tidak Memiliki Izin untuk Mengakses Halaman Ini
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mt-3 leading-relaxed">
        Akun Anda saat ini masuk sebagai role <strong className="text-slate-800 dark:text-slate-200">{user?.role || 'Guest'}</strong> ({user?.email}).
        {requiredPermission && (
          <span className="block mt-1 font-mono text-xs text-rose-600 dark:text-rose-400">
            Hak akses yang dibutuhkan: {requiredPermission}
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Button
          variant="primary"
          onClick={() => onNavigate('admin-dashboard')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Dashboard Utama</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => switchUser('SUPER_ADMIN')}
          className="gap-2 text-blue-600 border-blue-300"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Beralih ke Super Admin (Demo)</span>
        </Button>
      </div>
    </div>
  );
};
