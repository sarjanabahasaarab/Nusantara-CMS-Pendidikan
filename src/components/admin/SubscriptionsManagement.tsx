/**
 * Nusantara Education CMS - Manajemen Paket Langganan & Kuota Tenant
 * Phase 4 - Multi-Tenant Freemium Architecture & Usage Tracking
 */

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  HardDrive,
  Users,
  Globe,
  Code,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { SubscriptionTier, TenantSubscription } from '../../types';

interface SubscriptionsManagementProps {
  onNavigate: (view: any) => void;
}

export const SubscriptionsManagement: React.FC<SubscriptionsManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();

  const [subscription, setSubscription] = useState<TenantSubscription | null>(
    cmsStore.getTenantSubscription(tenantId)
  );
  const [usage] = useState(cmsStore.getTenantUsage(tenantId));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PROFESSIONAL');

  const refreshData = () => {
    setSubscription(cmsStore.getTenantSubscription(tenantId));
  };

  const PLANS: {
    tier: SubscriptionTier;
    name: string;
    price: string;
    description: string;
    maxUsers: number;
    maxStudents: number;
    maxStorageMb: number;
    customDomain: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    highlight?: boolean;
  }[] = [
    {
      tier: 'FREE',
      name: 'Starter Pendidikan',
      price: 'Rp 0',
      description: 'Ideal untuk sekolah rintisan, PKBM, atau madrasah skala kecil.',
      maxUsers: 50,
      maxStudents: 300,
      maxStorageMb: 2000,
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
    },
    {
      tier: 'BASIC',
      name: 'Sekolah Berkembang',
      price: 'Rp 450.000 / bln',
      description: 'Untuk SD dan SMP dengan rombel bertahap dan modul kurikulum standar.',
      maxUsers: 100,
      maxStudents: 800,
      maxStorageMb: 10000,
      customDomain: true,
      apiAccess: false,
      whiteLabel: false,
    },
    {
      tier: 'PROFESSIONAL',
      name: 'Institusi Unggul',
      price: 'Rp 1.250.000 / bln',
      description: 'Pilihan terlengkap SMA, SMK, dan Yayasan Pendidikan modern multi-jurusan.',
      maxUsers: 250,
      maxStudents: 2500,
      maxStorageMb: 35000,
      customDomain: true,
      apiAccess: true,
      whiteLabel: false,
      highlight: true,
    },
    {
      tier: 'ENTERPRISE',
      name: 'Perguruan Tinggi & Kampus',
      price: 'Kustom / Hubungi Kami',
      description: 'Sistem komprehensif universitas, politeknik, multi-kampus dengan SLA 99.9%.',
      maxUsers: 1000,
      maxStudents: 15000,
      maxStorageMb: 150000,
      customDomain: true,
      apiAccess: true,
      whiteLabel: true,
    },
  ];

  const handleApplyTier = (tier: SubscriptionTier) => {
    const plan = PLANS.find((p) => p.tier === tier);
    if (!plan) return;

    cmsStore.updateTenantSubscription(tenantId, {
      tier,
      maxUsers: plan.maxUsers,
      maxStudents: plan.maxStudents,
      maxStorageMb: plan.maxStorageMb,
      customDomainAllowed: plan.customDomain,
      apiAccessAllowed: plan.apiAccess,
      whiteLabelAllowed: plan.whiteLabel,
      status: 'ACTIVE',
    }, user);

    refreshData();
    setShowUpgradeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-blue-600" />
            Paket Langganan & Kuota Tenant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transparansi kuota pemakaian sistem, batas peserta didik, dan peningkatan kapasitas institusi.
          </p>
        </div>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm transition shadow-sm"
        >
          <Zap className="w-4 h-4" />
          Ubah / Upgrade Paket
        </button>
      </div>

      {/* Current Subscription Status Card */}
      {subscription && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Status Langganan Tenant Saat Ini
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Paket {subscription.tier}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {subscription.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tenant: <strong className="text-slate-800">{activeTenant?.name}</strong> • Mulai aktif:{' '}
                {new Date(subscription.startDate).toLocaleDateString('id-ID')}
              </p>
            </div>

            {/* Kuota Meter Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Kuota Siswa
                </span>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {usage?.studentCount || 34} / {subscription.maxStudents}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" /> Kuota Storage
                </span>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {Math.round((usage?.storageUsedMb || 1420) / 1024)} GB / {Math.round(subscription.maxStorageMb / 1024)} GB
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Custom Domain
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                  {subscription.customDomainAllowed ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Didukung
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Belum
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Matrix Comparison */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Pilihan Paket Layanan Platform
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = subscription?.tier === plan.tier;
            return (
              <div
                key={plan.tier}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition ${
                  plan.highlight
                    ? 'border-blue-500 bg-white ring-2 ring-blue-500 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {plan.tier}
                    </span>
                    {plan.highlight && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> Rekomendasi
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900">{plan.price}</div>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hingga <strong>{plan.maxStudents}</strong> Peserta Didik</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hingga <strong>{plan.maxUsers}</strong> Akun PTK & Staf</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Penyimpanan <strong>{Math.round(plan.maxStorageMb / 1024)} GB</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.customDomain ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={plan.customDomain ? '' : 'text-slate-400'}>
                        Custom Domain Institusi
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.apiAccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={plan.apiAccess ? '' : 'text-slate-400'}>
                        Integrasi REST API
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.whiteLabel ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={plan.whiteLabel ? '' : 'text-slate-400'}>
                        White-Label (Hapus Branding)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleApplyTier(plan.tier)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : plan.highlight
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCurrent ? 'Paket Aktif Saat Ini' : 'Pilih Paket Ini'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Ubah Paket Tenant</h3>
            <p className="text-xs text-slate-500">
              Pilih paket langganan yang sesuai dengan skala pertumbuhan peserta didik dan kapasitas server institusi Anda.
            </p>

            <div className="space-y-2">
              {PLANS.map((p) => (
                <div
                  key={p.tier}
                  onClick={() => setSelectedTier(p.tier)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedTier === p.tier
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    <span className="text-xs text-slate-500">{p.price} • {p.maxStudents} Siswa</span>
                  </div>
                  {selectedTier === p.tier && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleApplyTier(selectedTier)}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
              >
                Konfirmasi Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
