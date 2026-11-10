/**
 * Nusantara Education CMS - Pendaftaran Institusi Mandiri (Self-Service Onboarding)
 * Phase 4 - Multi-Tenant Institution Self-Registration
 */

import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  School,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { slugify } from '../../lib/utils';

interface RegisterInstitutionViewProps {
  onNavigate?: (view: any) => void;
  onSuccessLogin?: () => void;
  onNavigateHome?: () => void;
}

export const RegisterInstitutionView: React.FC<RegisterInstitutionViewProps> = ({ 
  onNavigate,
  onSuccessLogin,
  onNavigateHome,
}) => {
  const { switchTenant } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Institution Info
  const [instName, setInstName] = useState('');
  const [instSlug, setInstSlug] = useState('');
  const [instType, setInstType] = useState('SMA');
  const [instCategory, setInstCategory] = useState<'SEKOLAH' | 'KAMPUS' | 'PONDOK' | 'LEMBAGA'>('SEKOLAH');
  const [instNpsn, setInstNpsn] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instPhone, setInstPhone] = useState('');
  const [instAddress, setInstAddress] = useState('');

  // Step 2: Admin Account Info
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNameChange = (val: string) => {
    setInstName(val);
    setInstSlug(slugify(val));
  };

  const handleTypeChange = (val: string) => {
    setInstType(val);
    if (['UNIVERSITAS', 'POLITEKNIK', 'AKADEMI', 'INSTITUT'].includes(val)) {
      setInstCategory('KAMPUS');
    } else {
      setInstCategory('SEKOLAH');
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim()) {
      setError('Nama institusi wajib diisi.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword !== adminPasswordConfirm) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (adminPassword.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }

    try {
      const result = cmsStore.registerInstitution({
        institutionName: instName,
        slug: instSlug,
        institutionType: instType,
        category: instCategory,
        npsnOrCode: instNpsn,
        email: instEmail,
        phone: instPhone,
        address: instAddress,
        adminName,
        adminEmail,
        adminPhone,
        adminPassword,
      });

      switchTenant(result.tenant.id);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan institusi.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Institusi Berhasil Terdaftar!</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Selamat, <strong>{instName}</strong> telah siap dalam ekosistem Nusantara Education CMS dengan tenant terisolasi dan portal administrator mandiri.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-1">
            <p className="text-slate-500">Domain Instan:</p>
            <p className="font-bold text-blue-700">{instSlug}.nusantara.sch.id</p>
            <p className="text-slate-500 pt-1">Administrator:</p>
            <p className="font-semibold text-slate-800">{adminEmail}</p>
          </div>
          <button
            onClick={() => {
              if (onSuccessLogin) onSuccessLogin();
              else onNavigate?.('admin-academic-dashboard');
            }}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm"
          >
            Masuk ke Dashboard Akademik
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Top Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <Sparkles className="w-3.5 h-3.5" /> Platform SaaS Pendidikan Terpadu
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Daftarkan Sekolah atau Kampus Anda
          </h1>
          <p className="text-sm text-slate-500">
            Mulai dalam hitungan menit dengan portal website, CMS berita, dan manajemen kurikulum mandiri.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
              step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            <span>1</span> Profil Institusi
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
              step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            <span>2</span> Akun Administrator
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Informasi Institusi Pendidikan
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Nama Institusi Pendidikan
                </label>
                <input
                  type="text"
                  required
                  value={instName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: SMA Negeri 1 Bintang Harapan"
                  className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jenjang</label>
                  <select
                    value={instType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="SD">SD / Madrasah Ibtidaiyah</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                    <option value="UNIVERSITAS">Universitas</option>
                    <option value="POLITEKNIK">Politeknik</option>
                    <option value="AKADEMI">Akademi / Vokasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">NPSN / Kode PT</label>
                  <input
                    type="text"
                    value={instNpsn}
                    onChange={(e) => setInstNpsn(e.target.value)}
                    placeholder="20108922"
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Subdomain Website Institusi
                </label>
                <div className="flex mt-1">
                  <input
                    type="text"
                    required
                    value={instSlug}
                    onChange={(e) => setInstSlug(slugify(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-l-xl border border-r-0 border-slate-200"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">
                    .nusantara.sch.id
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Email Resmi</label>
                  <input
                    type="email"
                    required
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    placeholder="sekretariat@sekolah.sch.id"
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    value={instPhone}
                    onChange={(e) => setInstPhone(e.target.value)}
                    placeholder="(021) 7890-1234"
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={instAddress}
                  onChange={(e) => setInstAddress(e.target.value)}
                  placeholder="Jl. Pendidikan No. 1, Jakarta Pusat"
                  className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateHome) onNavigateHome();
                    else onNavigate?.('home');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Kembali ke Beranda
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition"
                >
                  Lanjut ke Langkah 2 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Akun Administrator Sekolah / Kampus
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                Akun ini akan memiliki hak akses penuh (Administrator Sekolah) untuk mengelola data akademik, kurikulum, dan mengundang dewan guru serta staf.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Lengkap Administrator</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Budi Santoso, S.Kom"
                  className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Email Login</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@sekolah.sch.id"
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Nomor HP</label>
                  <input
                    type="text"
                    required
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    required
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Langkah 1
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm"
                >
                  Selesaikan Pendaftaran <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
