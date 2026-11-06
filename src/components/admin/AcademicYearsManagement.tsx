/**
 * Nusantara Education CMS - Manajemen Tahun Ajaran & Semester
 * Phase 4 - Academic Periods & Year Closing Workflow
 */

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Lock,
  Clock,
  AlertCircle,
  FileText,
  Edit,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { AcademicYear, AcademicTerm } from '../../types';

interface AcademicYearsManagementProps {
  onNavigate: (view: any) => void;
}

export const AcademicYearsManagement: React.FC<AcademicYearsManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();

  const [years, setYears] = useState<AcademicYear[]>(cmsStore.getAcademicYears(tenantId));
  const [selectedYearId, setSelectedYearId] = useState<string>(
    cmsStore.getActiveAcademicYear(tenantId)?.id || years[0]?.id || ''
  );
  const [terms, setTerms] = useState<AcademicTerm[]>(
    cmsStore.getAcademicTerms(tenantId, selectedYearId)
  );

  const [showYearModal, setShowYearModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);

  // Form Year State
  const [yearName, setYearName] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [yearIsActive, setYearIsActive] = useState(false);
  const [yearNotes, setYearNotes] = useState('');

  // Form Term State
  const [termName, setTermName] = useState('Semester Ganjil');
  const [termType, setTermType] = useState<'ODD' | 'EVEN' | 'SHORT'>('ODD');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');
  const [termIsActive, setTermIsActive] = useState(false);

  const refreshData = () => {
    const freshYears = cmsStore.getAcademicYears(tenantId);
    setYears(freshYears);
    setTerms(cmsStore.getAcademicTerms(tenantId, selectedYearId));
  };

  const handleSelectYear = (id: string) => {
    setSelectedYearId(id);
    setTerms(cmsStore.getAcademicTerms(tenantId, id));
  };

  const handleActivateYear = (id: string) => {
    if (confirm('Aktifkan tahun ajaran ini? Seluruh portal dan jadwal akan beralih ke periode ini.')) {
      cmsStore.setActiveAcademicYear(id, tenantId, user);
      refreshData();
    }
  };

  const handleCloseYear = (id: string) => {
    if (confirm('Tutup resmi tahun ajaran ini? Setelah ditutup, nilai dan riwayat kelas akan diarsipkan.')) {
      cmsStore.closeAcademicYear(id, user);
      refreshData();
    }
  };

  const handleActivateTerm = (termId: string) => {
    cmsStore.setActiveAcademicTerm(termId, tenantId, user);
    refreshData();
  };

  const handleSaveYear = (e: React.FormEvent) => {
    e.preventDefault();
    cmsStore.createAcademicYear({
      tenantId,
      name: yearName,
      startDate: new Date(yearStart).toISOString(),
      endDate: new Date(yearEnd).toISOString(),
      isActive: yearIsActive,
      status: yearIsActive ? 'ACTIVE' : 'UPCOMING',
      notes: yearNotes,
    }, user);
    refreshData();
    setShowYearModal(false);
  };

  const handleSaveTerm = (e: React.FormEvent) => {
    e.preventDefault();
    cmsStore.createAcademicTerm({
      tenantId,
      academicYearId: selectedYearId,
      name: termName,
      termType,
      startDate: new Date(termStart).toISOString(),
      endDate: new Date(termEnd).toISOString(),
      isActive: termIsActive,
      status: termIsActive ? 'ACTIVE' : 'UPCOMING',
    }, user);
    refreshData();
    setShowTermModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-blue-600" />
            Tahun Ajaran & Semester
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengaturan kalender masa aktif pembelajaran, semester ganjil/genap, dan arsip tahunan.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setYearName('2027/2028');
              setYearStart('2027-07-15');
              setYearEnd('2028-06-25');
              setYearIsActive(false);
              setYearNotes('');
              setShowYearModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tahun Ajaran Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Daftar Tahun Ajaran */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Tahun Ajaran</h2>
          {years.map((year) => {
            const isSelected = selectedYearId === year.id;
            return (
              <div
                key={year.id}
                onClick={() => handleSelectYear(year.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{year.name}</h3>
                      {year.isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                        </span>
                      )}
                      {year.status === 'CLOSED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Ditutup
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(year.startDate).toLocaleDateString('id-ID')} — {new Date(year.endDate).toLocaleDateString('id-ID')}
                    </p>
                    {year.notes && <p className="text-xs text-slate-600 mt-2 italic">{year.notes}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {!year.isActive && year.status !== 'CLOSED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateYear(year.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                    >
                      Aktifkan
                    </button>
                  )}
                  {year.isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseYear(year.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 transition"
                    >
                      Tutup Tahun Ajaran
                    </button>
                  )}
                  <span className="text-xs text-slate-400 ml-auto flex items-center">
                    Pilih <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kolom Kanan: Rincian Semester / Periode dalam Tahun Ajaran */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Periode Akademik</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Semester pada Tahun {years.find((y) => y.id === selectedYearId)?.name}
              </h2>
            </div>
            <button
              onClick={() => {
                setTermName('Semester Genap');
                setTermType('EVEN');
                setTermStart('2027-01-05');
                setTermEnd('2027-06-25');
                setTermIsActive(false);
                setShowTermModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Semester
            </button>
          </div>

          <div className="space-y-4">
            {terms.map((term) => (
              <div
                key={term.id}
                className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  term.isActive
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{term.name}</h3>
                    {term.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Semester Berjalan (Aktif)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                        {term.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(term.startDate).toLocaleDateString('id-ID')} — {new Date(term.endDate).toLocaleDateString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!term.isActive && (
                    <button
                      onClick={() => handleActivateTerm(term.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                    >
                      Jadikan Semester Aktif
                    </button>
                  )}
                </div>
              </div>
            ))}

            {terms.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                Belum ada semester yang dikonfigurasi untuk tahun ajaran ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Tahun Ajaran */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Tambah Tahun Ajaran Baru</h3>
            <form onSubmit={handleSaveYear} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Tahun Akademik</label>
                <input
                  type="text"
                  required
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  placeholder="2027/2028"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={yearStart}
                    onChange={(e) => setYearStart(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={yearEnd}
                    onChange={(e) => setYearEnd(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Catatan / Kebijakan</label>
                <textarea
                  value={yearNotes}
                  onChange={(e) => setYearNotes(e.target.value)}
                  placeholder="Fokus implementasi kurikulum merdeka lanjutan..."
                  rows={2}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={yearIsActive}
                  onChange={(e) => setYearIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="activeCheck" className="text-xs font-medium text-slate-700">
                  Langsung jadikan Tahun Ajaran Aktif
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Semester */}
      {showTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Tambah Semester Baru</h3>
            <form onSubmit={handleSaveTerm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Semester</label>
                <input
                  type="text"
                  required
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  placeholder="Semester Ganjil"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tipe</label>
                  <select
                    value={termType}
                    onChange={(e: any) => setTermType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ODD">Ganjil</option>
                    <option value="EVEN">Genap</option>
                    <option value="SHORT">Antara / Pendek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Status Awal</label>
                  <select
                    value={termIsActive ? 'ACTIVE' : 'UPCOMING'}
                    onChange={(e) => setTermIsActive(e.target.value === 'ACTIVE')}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="UPCOMING">Akan Datang</option>
                    <option value="ACTIVE">Aktif Berjalan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTermModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
