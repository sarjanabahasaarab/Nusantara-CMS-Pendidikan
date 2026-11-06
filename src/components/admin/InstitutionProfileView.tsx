/**
 * Nusantara Education CMS - Profil & Identitas Institusi Pendidikan
 * Phase 4 - Multi-Tenant School & Campus Identity Configuration
 */

import React, { useState } from 'react';
import {
  Building2,
  Save,
  Globe,
  Award,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  Image,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { Tenant } from '../../types';

interface InstitutionProfileViewProps {
  onNavigate: (view: any) => void;
}

export const InstitutionProfileView: React.FC<InstitutionProfileViewProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();
  const currentTenant = cmsStore.getTenantById(tenantId) || activeTenant;
  const siteSettings = cmsStore.getSettings();

  const [name, setName] = useState(currentTenant?.name || '');
  const [institutionType, setInstitutionType] = useState(currentTenant?.institutionType || 'SMA');
  const [category, setCategory] = useState(currentTenant?.category || 'SEKOLAH');
  const [npsn, setNpsn] = useState(currentTenant?.npsnOrCode || siteSettings.npsn || '');
  const [customDomain, setCustomDomain] = useState(currentTenant?.customDomain || '');
  const [email, setEmail] = useState(currentTenant?.email || siteSettings.email || '');
  const [phone, setPhone] = useState(currentTenant?.phone || siteSettings.phone || '');
  const [address, setAddress] = useState(currentTenant?.address || siteSettings.address || '');
  const [city, setCity] = useState(currentTenant?.city || 'Jakarta');
  const [province, setProvince] = useState(currentTenant?.province || 'DKI Jakarta');
  const [postalCode, setPostalCode] = useState(currentTenant?.postalCode || '');
  const [logo, setLogo] = useState(currentTenant?.logo || siteSettings.logo || '');
  const [banner, setBanner] = useState(currentTenant?.bannerImage || siteSettings.heroImage || '');

  // Pimpinan Sekolah / Rektor
  const [principalName, setPrincipalName] = useState(siteSettings.principalName || '');
  const [principalTitle, setPrincipalTitle] = useState(siteSettings.principalTitle || '');
  const [accreditation, setAccreditation] = useState(siteSettings.accreditation || 'Akreditasi Unggul (A)');
  const [vision, setVision] = useState(siteSettings.vision || '');
  const [mission, setMission] = useState(siteSettings.mission || '');

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update Tenant Profil
    cmsStore.updateTenant(tenantId, {
      name,
      institutionType,
      category,
      npsnOrCode: npsn,
      customDomain,
      email,
      phone,
      address,
      city,
      province,
      postalCode,
      logo,
      bannerImage: banner,
    }, user);

    // 2. Update Site Settings (identitas publik sekolah)
    cmsStore.updateSettings({
      siteName: name,
      institutionType,
      npsn,
      email,
      phone,
      address,
      logo,
      heroImage: banner,
      principalName,
      principalTitle,
      accreditation,
      vision,
      mission,
    }, user);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-600" />
            Identitas & Profil Institusi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi identitas resmi, legalitas NPSN/Kode PT, akreditasi BAN, pimpinan, dan kontak.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Profil institusi dan konfigurasi sekolah berhasil diperbarui secara permanen.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Legalitas & Nama */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-blue-600" />
            Legalitas & Informasi Pokok
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Nama Resmi Institusi</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">NPSN / Kode Perguruan Tinggi</label>
              <input
                type="text"
                required
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Jenjang</label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white"
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
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white"
              >
                <option value="SEKOLAH">Sekolah</option>
                <option value="KAMPUS">Kampus</option>
                <option value="PONDOK">Pesantren / Pondok</option>
                <option value="LEMBAGA">Lembaga Pelatihan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Status Akreditasi</label>
              <input
                type="text"
                value={accreditation}
                onChange={(e) => setAccreditation(e.target.value)}
                placeholder="Akreditasi Unggul (A)"
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Custom Domain (Opsional)</label>
            <div className="relative mt-1">
              <Globe className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="sekolah.sch.id / kampus.ac.id"
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pimpinan Institusi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Pimpinan Institusi (Kepala Sekolah / Rektor)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder="Dra. Hj. Ratna Juwita, M.Pd"
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Jabatan Pimpinan</label>
              <input
                type="text"
                value={principalTitle}
                onChange={(e) => setPrincipalTitle(e.target.value)}
                placeholder="Kepala SMA Negeri Nusantara Mandiri"
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Alamat & Kontak */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Alamat & Kontak Resmi
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Alamat Kampus / Sekolah</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Kota / Kabupaten</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Provinsi</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Kode Pos</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Email Resmi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Telepon Kantor</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Visi & Misi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Visi & Misi Pendidikan
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Visi Institusi</label>
            <textarea
              rows={2}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">Misi Institusi</label>
            <textarea
              rows={4}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Profil Institusi
          </button>
        </div>
      </form>
    </div>
  );
};
