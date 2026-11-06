import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  TrendingUp,
  Compass,
  Megaphone,
  Phone,
  Share2,
  Globe,
  Save,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SiteSetting } from '../../types';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface SettingsManagementProps {
  settings: SiteSetting;
}

type SettingsTab =
  | 'identity'
  | 'principal'
  | 'stats'
  | 'vision'
  | 'ppdb'
  | 'contact'
  | 'social'
  | 'seo';

export const SettingsManagement: React.FC<SettingsManagementProps> = ({ settings }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SiteSetting>({ ...settings });
  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const canUpdate = hasPermission(user, 'settings.update');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;

    cmsStore.updateSettings(formData, user);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmReset = () => {
    cmsStore.resetToSeed(user);
    setResetModalOpen(false);
    window.location.reload();
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'identity', label: 'Identitas & Logo', icon: Building2 },
    { id: 'principal', label: 'Sambutan Kepala Sekolah', icon: GraduationCap },
    { id: 'stats', label: 'Statistik Sekolah', icon: TrendingUp },
    { id: 'vision', label: 'Visi, Misi & Pilar', icon: Compass },
    { id: 'ppdb', label: 'PPDB & Banner Hero', icon: Megaphone },
    { id: 'contact', label: 'Kontak & Operasional', icon: Phone },
    { id: 'social', label: 'Media Sosial', icon: Share2 },
    { id: 'seo', label: 'SEO & Hak Cipta', icon: Globe },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pengaturan Situs Terpadu (Input Manual)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh konten website publik dapat diubah secara langsung dan tersinkronisasi otomatis.
          </p>
        </div>

        {canUpdate && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="gap-2 font-bold shrink-0 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Pengaturan</span>
          </Button>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan situs berhasil disimpan! Seluruh halaman website publik telah diperbarui secara langsung.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all shrink-0 cursor-pointer border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* ========================================================================= */}
        {/* 1. TAB IDENTITAS & LOGO */}
        {/* ========================================================================= */}
        {activeTab === 'identity' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Identitas Institusi & Logo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Jenjang Pendidikan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.institutionType}
                    onChange={(e) =>
                      setFormData({ ...formData, institutionType: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="SD">Sekolah Dasar (SD)</option>
                    <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
                    <option value="SMA">Sekolah Menengah Atas (SMA)</option>
                    <option value="SMK">Sekolah Menengah Kejuruan (SMK)</option>
                    <option value="PERGURUAN_TINGGI">Perguruan Tinggi / Universitas</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Nama Resmi Sekolah / Kampus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Semboyan / Tagline Sekolah
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Deskripsi Profil Sekolah
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    NPSN (Nomor Pokok Sekolah Nasional)
                  </label>
                  <input
                    type="text"
                    value={formData.npsn || ''}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Status Akreditasi
                  </label>
                  <input
                    type="text"
                    value={formData.accreditation || ''}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Lembaga Akreditasi
                  </label>
                  <input
                    type="text"
                    value={formData.accreditationBody || ''}
                    onChange={(e) => setFormData({ ...formData, accreditationBody: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Gambar / Logo / Favicon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    URL Logo Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    URL Foto Hero Banner Beranda
                  </label>
                  <input
                    type="text"
                    value={formData.heroImage || ''}
                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 2. TAB SAMBUTAN KEPALA SEKOLAH */}
        {/* ========================================================================= */}
        {activeTab === 'principal' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span>Sambutan & Profil Pimpinan Institusi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Nama Lengkap Kepala Sekolah / Rektor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.principalName || ''}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Jabatan Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.principalTitle || ''}
                    onChange={(e) => setFormData({ ...formData, principalTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  URL Foto Resmi Kepala Sekolah
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={formData.principalImage || ''}
                    onChange={(e) => setFormData({ ...formData, principalImage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  {formData.principalImage && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      <img src={formData.principalImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Kutipan Mutiara Pimpinan (Quote)
                </label>
                <textarea
                  rows={2}
                  value={formData.principalQuote || ''}
                  onChange={(e) => setFormData({ ...formData, principalQuote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 italic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Teks Lengkap Pidato / Sambutan
                </label>
                <textarea
                  rows={6}
                  value={formData.principalWelcomeMessage || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, principalWelcomeMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 3. TAB STATISTIK SEKOLAH */}
        {/* ========================================================================= */}
        {activeTab === 'stats' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Angka Capaian & Statistik Sekolah</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-slate-500 text-xs mb-2">
                Empat angka indikator keberhasilan institusi yang tampil menonjol pada banner beranda website.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stat 1 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="font-bold text-blue-600 block">Indikator 1</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Angka / Nilai:</label>
                    <input
                      type="text"
                      value={formData.stat1Value || ''}
                      onChange={(e) => setFormData({ ...formData, stat1Value: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Keterangan Label:</label>
                    <input
                      type="text"
                      value={formData.stat1Label || ''}
                      onChange={(e) => setFormData({ ...formData, stat1Label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="font-bold text-emerald-600 block">Indikator 2</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Angka / Nilai:</label>
                    <input
                      type="text"
                      value={formData.stat2Value || ''}
                      onChange={(e) => setFormData({ ...formData, stat2Value: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Keterangan Label:</label>
                    <input
                      type="text"
                      value={formData.stat2Label || ''}
                      onChange={(e) => setFormData({ ...formData, stat2Label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="font-bold text-amber-600 block">Indikator 3</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Angka / Nilai:</label>
                    <input
                      type="text"
                      value={formData.stat3Value || ''}
                      onChange={(e) => setFormData({ ...formData, stat3Value: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Keterangan Label:</label>
                    <input
                      type="text"
                      value={formData.stat3Label || ''}
                      onChange={(e) => setFormData({ ...formData, stat3Label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="font-bold text-indigo-600 block">Indikator 4</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Angka / Nilai:</label>
                    <input
                      type="text"
                      value={formData.stat4Value || ''}
                      onChange={(e) => setFormData({ ...formData, stat4Value: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Keterangan Label:</label>
                    <input
                      type="text"
                      value={formData.stat4Label || ''}
                      onChange={(e) => setFormData({ ...formData, stat4Label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 4. TAB VISI, MISI & FILOSOFI */}
        {/* ========================================================================= */}
        {activeTab === 'vision' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Visi, Misi & Falsafah Pendidikan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Visi Institusi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.vision || ''}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Misi Institusi (Gunakan baris baru atau penomoran 1., 2., 3.)
                </label>
                <textarea
                  rows={6}
                  value={formData.mission || ''}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 leading-relaxed font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Filosofi / Nilai Inti Pendidikan
                </label>
                <input
                  type="text"
                  value={formData.educationalPhilosophy || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, educationalPhilosophy: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 5. TAB PPDB & BANNER HERO */}
        {/* ========================================================================= */}
        {activeTab === 'ppdb' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-500" />
                <span>Pengaturan PPDB & Banner Pengumuman</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Status Penerimaan Peserta Didik Baru (PPDB)
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Aktifkan untuk menampilkan badge pendaftaran terbuka di bagian atas beranda.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ppdbActive}
                    onChange={(e) => setFormData({ ...formData, ppdbActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Teks Pengumuman Banner Hero
                </label>
                <input
                  type="text"
                  value={formData.ppdbNotice || ''}
                  onChange={(e) => setFormData({ ...formData, ppdbNotice: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Label Tombol CTA PPDB
                  </label>
                  <input
                    type="text"
                    value={formData.ppdbCtaText || ''}
                    onChange={(e) => setFormData({ ...formData, ppdbCtaText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tautan Tujuan Tombol (URL atau /kontak)
                  </label>
                  <input
                    type="text"
                    value={formData.ppdbCtaUrl || ''}
                    onChange={(e) => setFormData({ ...formData, ppdbCtaUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 6. TAB KONTAK & OPERASIONAL */}
        {/* ========================================================================= */}
        {activeTab === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>Kontak, Alamat Kampus & Jam Layanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Telepon Sekretariat
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Hotline / WhatsApp Center
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Alamat Lengkap Kampus
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Jam Operasional (Hari Kerja)
                  </label>
                  <input
                    type="text"
                    value={formData.workingHoursWeekday || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, workingHoursWeekday: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Jam Operasional (Akhir Pekan / Sabtu)
                  </label>
                  <input
                    type="text"
                    value={formData.workingHoursWeekend || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, workingHoursWeekend: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tautan Google Maps Lokasi Kampus
                </label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={formData.mapsEmbedUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mapsEmbedUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 7. TAB MEDIA SOSIAL */}
        {/* ========================================================================= */}
        {activeTab === 'social' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-500" />
                <span>Kanal Media Sosial Resmi Institusi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={formData.facebook || ''}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={formData.youtube || ''}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/..."
                    value={formData.tiktok || ''}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Twitter / X URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={formData.twitter || ''}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 8. TAB SEO & HAK CIPTA */}
        {/* ========================================================================= */}
        {activeTab === 'seo' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>SEO Global & Hak Cipta Footer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Default Meta Title Website
                </label>
                <input
                  type="text"
                  value={formData.metaTitle || ''}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Default Meta Description (Google SERP)
                </label>
                <textarea
                  rows={3}
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Teks Hak Cipta di Footer
                </label>
                <input
                  type="text"
                  value={formData.footerCopyright || ''}
                  onChange={(e) => setFormData({ ...formData, footerCopyright: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            className="text-rose-600 hover:text-rose-700 border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset ke Data Awal Seed
          </Button>

          {canUpdate && (
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="gap-2 font-bold px-6 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </Button>
          )}
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Konfirmasi Reset Basis Data"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <p>
              Tindakan ini akan memuat ulang data default seeder Phase 1. Seluruh artikel dan modifikasi buatan Anda akan direset. Lanjutkan?
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmReset}>
              Ya, Reset Basis Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
