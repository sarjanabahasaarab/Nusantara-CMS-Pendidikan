/**
 * Nusantara Education CMS - Manajemen Mata Pelajaran & Mata Kuliah
 * Phase 4 - Curriculum Subjects, Credits (SKS), and Passing Grades (KKM)
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Clock,
  Award,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { Subject } from '../../types';

interface SubjectsManagementProps {
  onNavigate: (view: any) => void;
}

export const SubjectsManagement: React.FC<SubjectsManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();
  const isKampus = activeTenant?.category === 'KAMPUS';

  const [subjects, setSubjects] = useState<Subject[]>(cmsStore.getSubjects(tenantId));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'WAJIB' | 'PEMINATAN' | 'KEJURUAN' | 'PRAKTIKUM' | 'UMUM'>('WAJIB');
  const [formCredits, setFormCredits] = useState(3);
  const [formPassingGrade, setFormPassingGrade] = useState(75.0);
  const [formDescription, setFormDescription] = useState('');

  const refreshData = () => {
    setSubjects(cmsStore.getSubjects(tenantId));
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedSubjectId(null);
    setFormCode('');
    setFormName('');
    setFormCategory('WAJIB');
    setFormCredits(isKampus ? 3 : 4);
    setFormPassingGrade(75.0);
    setFormDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (subj: Subject) => {
    setIsEditing(true);
    setSelectedSubjectId(subj.id);
    setFormCode(subj.code);
    setFormName(subj.name);
    setFormCategory(subj.category as any);
    setFormCredits(subj.creditHours);
    setFormPassingGrade(subj.minPassingGrade);
    setFormDescription(subj.description || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedSubjectId) {
      cmsStore.updateSubject(selectedSubjectId, {
        code: formCode,
        name: formName,
        category: formCategory,
        creditHours: Number(formCredits),
        minPassingGrade: Number(formPassingGrade),
        description: formDescription,
      }, user);
    } else {
      cmsStore.createSubject({
        tenantId,
        code: formCode,
        name: formName,
        category: formCategory,
        creditHours: Number(formCredits),
        minPassingGrade: Number(formPassingGrade),
        description: formDescription,
        isActive: true,
      }, user);
    }
    refreshData();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus mata pelajaran ini dari kurikulum institusi?')) {
      cmsStore.deleteSubject(id, user);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-600" />
            {isKampus ? 'Mata Kuliah Perguruan Tinggi' : 'Mata Pelajaran Kurikulum'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Katalog mata pelajaran, bobot jam mengajar/SKS, dan kriteria ketuntasan minimal (KKM).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah {isKampus ? 'Mata Kuliah' : 'Mata Pelajaran'}
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama mata pelajaran atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="WAJIB">Wajib Nasional</option>
          <option value="PEMINATAN">Peminatan / Pilihan</option>
          <option value="KEJURUAN">Kejuruan / Vokasi</option>
          <option value="PRAKTIKUM">Praktikum Mandiri</option>
          <option value="UMUM">Umum</option>
        </select>
      </div>

      {/* Grid Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {s.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{s.name}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {s.category}
                </span>
              </div>

              {s.description && (
                <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                  {s.description}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {isKampus ? 'Bobot SKS:' : 'Jam Pelajaran (JP):'}
                  </span>
                  <span className="font-bold text-blue-700">{s.creditHours} {isKampus ? 'SKS' : 'JP/Minggu'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> KKM / Nilai Minimum:
                  </span>
                  <span className="font-bold text-emerald-600">{s.minPassingGrade}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1.5 text-slate-400 hover:text-blue-600 transition"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Ubah Informasi Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kode Mapel/MK</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="MAT-10 / INF101"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="WAJIB">Wajib</option>
                    <option value="PEMINATAN">Peminatan</option>
                    <option value="KEJURUAN">Kejuruan</option>
                    <option value="PRAKTIKUM">Praktikum</option>
                    <option value="UMUM">Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Matematika Tingkat Lanjut"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    {isKampus ? 'Bobot SKS' : 'Alokasi Jam Mengajar (JP/Minggu)'}
                  </label>
                  <input
                    type="number"
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">KKM / Standar Kelulusan</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formPassingGrade}
                    onChange={(e) => setFormPassingGrade(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Deskripsi & Ruang Lingkup</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Cakupan materi esensial, kompetensi capaian belajar..."
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
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
