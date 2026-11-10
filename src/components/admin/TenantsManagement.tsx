/**
 * Nusantara Education CMS - Manajemen Tenant Multi-Institusi
 * Phase 4 - Multi-Tenant SaaS Architecture
 */

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
  ArrowRightLeft,
  School,
  GraduationCap,
  Sparkles,
  Edit,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { Tenant } from '../../types';

interface TenantsManagementProps {
  onNavigate: (view: any) => void;
}

export const TenantsManagement: React.FC<TenantsManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant, switchTenant } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>(cmsStore.getTenants());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formType, setFormType] = useState('SMA');
  const [formCategory, setFormCategory] = useState<'SEKOLAH' | 'KAMPUS' | 'PONDOK' | 'LEMBAGA'>('SEKOLAH');
  const [formNpsn, setFormNpsn] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING_VERIFICATION'>('ACTIVE');

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || (Array.isArray(user?.roles) && user.roles.includes('SUPER_ADMIN'));

  const refreshData = () => {
    setTenants(cmsStore.getTenants());
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.npsnOrCode && t.npsnOrCode.includes(searchQuery));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || t.institutionType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormName('');
    setFormSlug('');
    setFormType('SMA');
    setFormCategory('SEKOLAH');
    setFormNpsn('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCity('');
    setFormStatus('ACTIVE');
    setShowModal(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setIsEditing(true);
    setSelectedTenant(tenant);
    setFormName(tenant.name);
    setFormSlug(tenant.slug);
    setFormType(tenant.institutionType || (tenant.type as string) || 'SMA');
    setFormCategory((tenant.category as any) || 'SEKOLAH');
    setFormNpsn(tenant.npsnOrCode || '');
    setFormEmail(tenant.email || '');
    setFormPhone(tenant.phone || '');
    setFormAddress(tenant.address || '');
    setFormCity(tenant.city || '');
    setFormStatus((tenant.status as any) || 'ACTIVE');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (isEditing && selectedTenant) {
      cmsStore.updateTenant(selectedTenant.id, {
        name: formName,
        slug: formSlug,
        institutionType: formType,
        category: formCategory,
        npsnOrCode: formNpsn,
        email: formEmail,
        phone: formPhone,
        address: formAddress,
        city: formCity,
        status: formStatus,
      }, user);
    } else {
      cmsStore.createTenant({
        name: formName,
        slug: formSlug,
        institutionType: formType,
        category: formCategory,
        npsnOrCode: formNpsn,
        email: formEmail,
        phone: formPhone,
        address: formAddress,
        city: formCity,
        status: formStatus,
      }, user);
    }

    refreshData();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus tenant institusi ini? Seluruh data terhubung akan diisolasi.')) {
      cmsStore.deleteTenant(id, user);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-600" />
            Manajemen Multi-Tenant Institusi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola sekolah, madrasah, dan kampus perguruan tinggi dalam ekosistem SaaS terintegrasi.
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-2.5">
            <button
              onClick={() => onNavigate('register-institution')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              Onboarding Mandiri
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Tenant
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama institusi, slug, atau NPSN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Ditangguhkan</option>
              <option value="EXPIRED">Kedaluwarsa</option>
              <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="SD">SD / MI</option>
              <option value="SMP">SMP / MTs</option>
              <option value="SMA">SMA / MA</option>
              <option value="SMK">SMK</option>
              <option value="UNIVERSITAS">Universitas</option>
              <option value="POLITEKNIK">Politeknik</option>
              <option value="AKADEMI">Akademi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((t) => {
          const isActiveCurrent = activeTenant?.id === t.id;
          const sub = cmsStore.getTenantSubscription(t.id);
          const usage = cmsStore.getTenantUsage(t.id);

          return (
            <div
              key={t.id}
              className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                isActiveCurrent
                  ? 'border-blue-500 bg-blue-50/20 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop'}
                      alt={t.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {t.institutionType} • {t.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{t.name}</h3>
                      <p className="text-xs text-slate-400">NPSN: {t.npsnOrCode || '-'}</p>
                    </div>
                  </div>
                  {isActiveCurrent && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  )}
                </div>

                {/* Domain & Paket */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Domain:
                    </span>
                    <span className="font-medium text-slate-800">{t.customDomain || `${t.subdomain}.nusantara.sch.id`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Paket Layanan:</span>
                    <span className="font-bold text-indigo-600">{sub?.tier || 'FREE'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lokasi:</span>
                    <span>{t.city || t.address || 'Indonesia'}</span>
                  </div>
                </div>

                {/* Kuota & Usage Bar */}
                {sub && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Kapasitas Pengguna</span>
                      <span className="font-bold text-slate-700">
                        {usage?.userCount || 10} / {sub.maxUsers}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, ((usage?.userCount || 10) / (sub.maxUsers || 100)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => switchTenant(t.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isActiveCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  disabled={isActiveCurrent}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {isActiveCurrent ? 'Tenant Saat Ini' : 'Pindah ke Tenant Ini'}
                </button>
                {isSuperAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Ubah Profil Tenant"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {t.id !== 'tenant-sman-nusantara' && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                        title="Hapus Tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah/Ubah Tenant */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Ubah Informasi Tenant Institusi' : 'Tambah Tenant Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Institusi</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: SMA Negeri 1 Bintang Harapan"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jenjang</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                    <option value="UNIVERSITAS">Universitas</option>
                    <option value="POLITEKNIK">Politeknik</option>
                    <option value="AKADEMI">Akademi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="SEKOLAH">Sekolah</option>
                    <option value="KAMPUS">Kampus</option>
                    <option value="PONDOK">Pesantren / Pondok</option>
                    <option value="LEMBAGA">Lembaga Diklat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">NPSN / Kode PT</label>
                  <input
                    type="text"
                    value={formNpsn}
                    onChange={(e) => setFormNpsn(e.target.value)}
                    placeholder="20108922"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Status Operasional</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ACTIVE">Aktif (Active)</option>
                    <option value="SUSPENDED">Ditangguhkan</option>
                    <option value="EXPIRED">Kedaluwarsa</option>
                    <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Email Kontak Resmi</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="sekretariat@sekolah.sch.id"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Kota / Wilayah</label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="Jakarta Pusat"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
