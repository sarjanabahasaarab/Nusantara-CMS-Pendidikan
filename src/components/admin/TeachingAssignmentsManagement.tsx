/**
 * Nusantara Education CMS - Pembagian Tugas Mengajar & Beban Kerja Guru
 * Phase 4 - Workload Tracking (Standar 24 Jam Mengajar Nasional)
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Users,
  Edit,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { TeachingAssignment, TeacherProfile } from '../../types';

interface TeachingAssignmentsManagementProps {
  onNavigate?: (view: any) => void;
}

export const TeachingAssignmentsManagement: React.FC<TeachingAssignmentsManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();
  const currentAy = cmsStore.getActiveAcademicYear(tenantId);
  const currentTerm = cmsStore.getActiveAcademicTerm(tenantId);

  const [assignments, setAssignments] = useState<TeachingAssignment[]>(
    cmsStore.getTeachingAssignments(tenantId, currentAy?.id)
  );
  const teachers: TeacherProfile[] = cmsStore.getTeachers();
  const classes = cmsStore.getAcademicClasses(tenantId, currentAy?.id);
  const subjects = cmsStore.getSubjects(tenantId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formHours, setFormHours] = useState(4);
  const [formNotes, setFormNotes] = useState('');

  const refreshData = () => {
    setAssignments(cmsStore.getTeachingAssignments(tenantId, currentAy?.id));
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeacher = selectedTeacherFilter === 'ALL' || a.teacherId === selectedTeacherFilter;
    return matchesSearch && matchesTeacher;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormTeacherId(teachers[0]?.id || '');
    setFormSubjectId(subjects[0]?.id || '');
    setFormClassId(classes[0]?.id || '');
    setFormHours(4);
    setFormNotes('');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === formTeacherId);
    const subject = subjects.find((s) => s.id === formSubjectId);
    const cls = classes.find((c) => c.id === formClassId);

    if (!teacher || !subject || !cls) return;

    if (isEditing && selectedId) {
      cmsStore.updateTeachingAssignment(selectedId, {
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        subjectId: subject.id,
        subjectName: subject.name,
        classId: cls.id,
        className: cls.name,
        hoursPerWeek: Number(formHours),
        notes: formNotes,
      }, user);
    } else {
      cmsStore.createTeachingAssignment({
        tenantId,
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        subjectId: subject.id,
        subjectName: subject.name,
        classId: cls.id,
        className: cls.name,
        academicYearId: currentAy?.id || 'ay-default',
        academicTermId: currentTerm?.id,
        hoursPerWeek: Number(formHours),
        notes: formNotes,
      }, user);
    }

    refreshData();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus penugasan mengajar ini?')) {
      cmsStore.deleteTeachingAssignment(id, user);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            Pembagian Tugas Mengajar & Beban Guru
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Penetapan guru pengampu mata pelajaran pada rombel serta monitoring pemenuhan kuota 24 jam tatap muka.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Penugasan Mengajar
        </button>
      </div>

      {/* Guru Workload Progress Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Monitoring Pemenuhan Jam Mengajar Guru ({currentAy?.name || 'Tahun Aktif'})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => {
            const workload = cmsStore.getTeacherWorkload(teacher.id, currentAy?.id);
            const percent = Math.min(100, Math.round((workload.totalHours / 24) * 100));
            return (
              <div key={teacher.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{teacher.fullName}</h4>
                    <p className="text-xs text-slate-400">NIP: {teacher.nip || '-'}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      workload.isWorkloadStandardMet
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {workload.totalHours} / 24 Jam
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      workload.isWorkloadStandardMet ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{workload.assignments.length} Rombongan Belajar</span>
                  <span className="font-semibold">{percent}% Kuota</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, mata pelajaran, atau rombel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedTeacherFilter}
          onChange={(e) => setSelectedTeacherFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <option value="ALL">Semua Guru Pengampu</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Table Daftar Penugasan */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Guru / Dosen Pengampu</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Rombongan Belajar</th>
                <th className="px-6 py-4 text-center">Beban (Jam/Mg)</th>
                <th className="px-6 py-4">Catatan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{a.teacherName}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-blue-700">{a.subjectName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {a.className}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-900">
                    {a.hoursPerWeek} Jam
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{a.notes || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Hapus Penugasan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Belum ada penugasan mengajar yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Penugasan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Ubah Penugasan Mengajar' : 'Tetapkan Penugasan Mengajar Guru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Guru Pengampu</label>
                <select
                  required
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Mata Pelajaran</label>
                  <select
                    required
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Rombongan Belajar</label>
                  <select
                    required
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Alokasi Jam Mengajar per Minggu (JP)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={formHours}
                  onChange={(e) => setFormHours(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Catatan Tugas Tambahan</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Koordinator Olimpiade / Praktikum Lab"
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
                  Simpan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
