/**
 * Nusantara Education CMS - Kalender Akademik & Agenda Institusi
 * Phase 4 - Institutional Calendar & Event Schedules
 */

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  Trash2,
  Edit,
  Tag,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { AcademicCalendarEvent } from '../../types';

interface AcademicCalendarManagementProps {
  onNavigate: (view: any) => void;
}

export const AcademicCalendarManagement: React.FC<AcademicCalendarManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();
  const currentAy = cmsStore.getActiveAcademicYear(tenantId);

  const [events, setEvents] = useState<AcademicCalendarEvent[]>(
    cmsStore.getAcademicCalendarEvents(tenantId, currentAy?.id)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<
    'HOLIDAY' | 'EXAM' | 'ORIENTATION' | 'REGISTRATION_PPDB' | 'SEMESTER_BREAK' | 'GRADUATION' | 'CEREMONY' | 'OTHER'
  >('EXAM');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formLocation, setFormLocation] = useState('Kampus Utama');
  const [formDesc, setFormDesc] = useState('');
  const [formAudience, setFormAudience] = useState<'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'PUBLIC'>('ALL');

  const refreshData = () => {
    setEvents(cmsStore.getAcademicCalendarEvents(tenantId, currentAy?.id));
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedEventId(null);
    setFormTitle('');
    setFormCategory('EXAM');
    setFormStart('2026-10-15');
    setFormEnd('2026-10-22');
    setFormColor('#3b82f6');
    setFormLocation('Kampus Utama');
    setFormDesc('');
    setFormAudience('ALL');
    setShowModal(true);
  };

  const handleOpenEdit = (ev: AcademicCalendarEvent) => {
    setIsEditing(true);
    setSelectedEventId(ev.id);
    setFormTitle(ev.title);
    setFormCategory(ev.category as any);
    setFormStart(ev.startDate.slice(0, 10));
    setFormEnd(ev.endDate.slice(0, 10));
    setFormColor(ev.color || '#3b82f6');
    setFormLocation(ev.location || '');
    setFormDesc(ev.description || '');
    setFormAudience(ev.targetAudience as any);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedEventId) {
      cmsStore.updateAcademicCalendarEvent(selectedEventId, {
        title: formTitle,
        category: formCategory,
        startDate: new Date(formStart).toISOString(),
        endDate: new Date(formEnd).toISOString(),
        color: formColor,
        location: formLocation,
        description: formDesc,
        targetAudience: formAudience,
      }, user);
    } else {
      cmsStore.createAcademicCalendarEvent({
        tenantId,
        academicYearId: currentAy?.id,
        title: formTitle,
        category: formCategory,
        startDate: new Date(formStart).toISOString(),
        endDate: new Date(formEnd).toISOString(),
        isAllDay: true,
        color: formColor,
        location: formLocation,
        description: formDesc,
        targetAudience: formAudience,
      }, user);
    }
    refreshData();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus agenda kalender akademik ini?')) {
      cmsStore.deleteAcademicCalendarEvent(id, user);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-blue-600" />
            Kalender Akademik Institusi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Penjadwalan hari efektif pembelajaran, asesmen sumatif, libur semester, dan perayaan institusi.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Agenda Kalender
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul kegiatan atau lokasi..."
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
          <option value="EXAM">Ujian & Asesmen</option>
          <option value="ORIENTATION">MPLS / Orientasi</option>
          <option value="HOLIDAY">Hari Libur Nasional</option>
          <option value="SEMESTER_BREAK">Libur Akhir Semester</option>
          <option value="CEREMONY">Upacara & Peringatan</option>
          <option value="REGISTRATION_PPDB">Penerimaan Siswa (PPDB)</option>
          <option value="GRADUATION">Wisuda / Pelepasan</option>
        </select>
      </div>

      {/* Grid Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => {
          const start = new Date(ev.startDate);
          const end = new Date(ev.endDate);
          const sameDay = start.toDateString() === end.toDateString();

          return (
            <div
              key={ev.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-xs"
                    style={{ backgroundColor: ev.color || '#3b82f6' }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                    {ev.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3 line-clamp-2 leading-snug">
                  {ev.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {start.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {!sameDay && ` — ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  </p>
                  {ev.location && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ev.location}
                    </p>
                  )}
                </div>

                {ev.description && (
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium">
                  Sasaran: {ev.targetAudience}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah/Ubah Event */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Ubah Agenda Kalender' : 'Tambah Agenda Kalender Akademik'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Judul Kegiatan / Agenda</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Asesmen Sumatif Akhir Semester (ASAS)"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="EXAM">Ujian & Asesmen</option>
                    <option value="ORIENTATION">MPLS / Orientasi</option>
                    <option value="HOLIDAY">Hari Libur Nasional</option>
                    <option value="SEMESTER_BREAK">Libur Akhir Semester</option>
                    <option value="CEREMONY">Upacara & Peringatan</option>
                    <option value="REGISTRATION_PPDB">Penerimaan Siswa (PPDB)</option>
                    <option value="GRADUATION">Wisuda / Pelepasan</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Warna Label</label>
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full mt-1 h-9 p-1 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Lokasi</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ruang Kelas & Lab Komputer"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Target Peserta</label>
                  <select
                    value={formAudience}
                    onChange={(e: any) => setFormAudience(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ALL">Seluruh Civitas</option>
                    <option value="STUDENTS">Khusus Peserta Didik</option>
                    <option value="TEACHERS">Khusus Pendidik & Staf</option>
                    <option value="PARENTS">Orang Tua / Wali Murid</option>
                    <option value="PUBLIC">Masyarakat Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Keterangan / Panduan</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Instruksi pelaksanaan dan perlengkapan yang perlu dibawa..."
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
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
