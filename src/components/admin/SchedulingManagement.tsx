/**
 * Nusantara Education CMS - Mesin Penyusun Jadwal Bebas Bentrok (Scheduling Engine)
 * Phase 4 - Real-time 3-Way Conflict Validation & Visual Timetable Grid
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Filter,
  Users,
  DoorOpen,
  GraduationCap,
  Sparkles,
  Trash2,
  Edit,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { ScheduleItem, TeacherProfile } from '../../types';

interface SchedulingManagementProps {
  onNavigate?: (view: any) => void;
}

export const SchedulingManagement: React.FC<SchedulingManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();
  const currentAy = cmsStore.getActiveAcademicYear(tenantId);
  const currentTerm = cmsStore.getActiveAcademicTerm(tenantId);

  const [schedules, setSchedules] = useState<ScheduleItem[]>(
    cmsStore.getScheduleItems({ tenantId, academicYearId: currentAy?.id, academicTermId: currentTerm?.id })
  );

  const classes = cmsStore.getAcademicClasses(tenantId, currentAy?.id);
  const teachers: TeacherProfile[] = cmsStore.getTeachers();
  const subjects = cmsStore.getSubjects(tenantId);
  const rooms = cmsStore.getRooms(tenantId);

  // Filters
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [filterClassId, setFilterClassId] = useState<string>('ALL');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('ALL');
  const [filterRoomId, setFilterRoomId] = useState<string>('ALL');
  const [filterDay, setFilterDay] = useState<number>(0); // 0 = all

  // Form Modal
  const [showModal, setShowModal] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [formDay, setFormDay] = useState(1); // 1 = Senin
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('09:00');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formRoomId, setFormRoomId] = useState(rooms[0]?.id || '');
  const [formNotes, setFormNotes] = useState('');

  const refreshData = () => {
    setSchedules(
      cmsStore.getScheduleItems({
        tenantId,
        academicYearId: currentAy?.id,
        academicTermId: currentTerm?.id,
      })
    );
  };

  const DAYS = [
    { num: 1, name: 'Senin' },
    { num: 2, name: 'Selasa' },
    { num: 3, name: 'Rabu' },
    { num: 4, name: 'Kamis' },
    { num: 5, name: 'Jumat' },
  ];

  const TIME_SLOTS = [
    { start: '07:30', end: '09:00', label: 'Sesi 1 (07:30 - 09:00)' },
    { start: '09:30', end: '11:00', label: 'Sesi 2 (09:30 - 11:00)' },
    { start: '11:15', end: '12:45', label: 'Sesi 3 (11:15 - 12:45)' },
    { start: '13:30', end: '15:00', label: 'Sesi 4 (13:30 - 15:00)' },
  ];

  const filteredSchedules = schedules.filter((item) => {
    if (filterClassId !== 'ALL' && item.classId !== filterClassId) return false;
    if (filterTeacherId !== 'ALL' && item.teacherId !== filterTeacherId) return false;
    if (filterRoomId !== 'ALL' && item.roomId !== filterRoomId) return false;
    if (filterDay !== 0 && item.dayOfWeek !== filterDay) return false;
    return true;
  });

  const handleOpenCreate = (day?: number, start?: string, end?: string) => {
    setConflictError(null);
    if (day) setFormDay(day);
    if (start) setFormStartTime(start);
    if (end) setFormEndTime(end);
    setFormNotes('');
    setShowModal(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const cls = classes.find((c) => c.id === formClassId);
    const teacher = teachers.find((t) => t.id === formTeacherId);
    const subject = subjects.find((s) => s.id === formSubjectId);
    const room = rooms.find((r) => r.id === formRoomId);

    if (!cls || !teacher || !subject) return;

    try {
      cmsStore.createScheduleItem({
        tenantId,
        academicYearId: currentAy?.id || 'ay-default',
        academicTermId: currentTerm?.id || 'term-default',
        classId: cls.id,
        className: cls.name,
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        subjectId: subject.id,
        subjectName: subject.name,
        roomId: room?.id,
        roomCode: room?.code,
        dayOfWeek: Number(formDay),
        startTime: formStartTime,
        endTime: formEndTime,
        timeSlotIndex: 1,
        sessionNotes: formNotes,
      }, user);

      refreshData();
      setShowModal(false);
    } catch (err: any) {
      setConflictError(err.message || 'Terjadi bentrok jadwal pembelajaran.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus sesi jadwal pelajaran ini?')) {
      cmsStore.deleteScheduleItem(id, user);
      refreshData();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-blue-600" />
            Jadwal Pelajaran Bebas Bentrok
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Engine penyusun jadwal otomatis dengan validasi 3-Dimensi: bentrok guru, bentrok kelas, dan bentrok ruangan.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            Cetak Jadwal (PDF)
          </button>
          <button
            onClick={() => handleOpenCreate()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Sesi Jadwal
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center">
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">Semua Rombel / Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterTeacherId}
            onChange={(e) => setFilterTeacherId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">Semua Guru Pengampu</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>

          <select
            value={filterRoomId}
            onChange={(e) => setFilterRoomId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">Semua Ruangan / Lab</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'GRID' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriks Mingguan
          </button>
          <button
            onClick={() => setViewMode('LIST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'LIST' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Sesi
          </button>
        </div>
      </div>

      {/* Grid View Mingguan */}
      {viewMode === 'GRID' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-32 border-r border-slate-200 text-center">Waktu</th>
                  {DAYS.map((day) => (
                    <th key={day.num} className="px-4 py-3.5 border-r border-slate-200 text-center">
                      {day.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {TIME_SLOTS.map((slot, sIdx) => (
                  <tr key={sIdx} className="hover:bg-slate-50/30 transition">
                    <td className="px-3 py-4 border-r border-slate-200 text-center bg-slate-50/60 font-bold text-xs text-slate-700">
                      <div>{slot.start}</div>
                      <div className="text-[10px] text-slate-400 font-normal">s/d</div>
                      <div>{slot.end}</div>
                    </td>
                    {DAYS.map((day) => {
                      const itemsInSlot = filteredSchedules.filter(
                        (item) => item.dayOfWeek === day.num && item.startTime >= slot.start && item.startTime < slot.end
                      );

                      return (
                        <td
                          key={day.num}
                          className="px-2.5 py-2.5 border-r border-slate-200 align-top h-28 relative group"
                        >
                          {itemsInSlot.map((sch) => (
                            <div
                              key={sch.id}
                              className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-2.5 shadow-2xs mb-2 transition hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-[10px] font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                                  {sch.className}
                                </span>
                                <button
                                  onClick={() => handleDelete(sch.id)}
                                  className="text-slate-400 hover:text-red-600 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                                {sch.subjectName}
                              </h4>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                                {sch.teacherName}
                              </p>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                                <span>{sch.roomCode || 'Kelas'}</span>
                                <span>{sch.startTime}-{sch.endTime}</span>
                              </div>
                            </div>
                          ))}

                          {itemsInSlot.length === 0 && (
                            <button
                              onClick={() => handleOpenCreate(day.num, slot.start, slot.end)}
                              className="w-full h-full min-h-[50px] border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition text-xs font-semibold"
                            >
                              + Jadwalkan
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'LIST' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Hari & Jam</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Rombel</th>
                <th className="px-6 py-4">Guru Pengampu</th>
                <th className="px-6 py-4">Ruang</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.map((sch) => {
                const dayName = DAYS.find((d) => d.num === sch.dayOfWeek)?.name || 'Senin';
                return (
                  <tr key={sch.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{dayName}</span>
                      <span className="text-xs text-slate-400">{sch.startTime} - {sch.endTime}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-700">{sch.subjectName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {sch.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{sch.teacherName}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{sch.roomCode || 'Ruang Fleksibel'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sch.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Jadwal dengan Live Conflict Checking */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Susun Sesi Jadwal Pembelajaran
            </h3>

            {/* Warning Bentrok jika terdeteksi */}
            {conflictError && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">
                  <strong>Bentrok Jadwal Terdeteksi!</strong>
                  <p className="mt-0.5 text-red-600">{conflictError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSchedule} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Hari</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {DAYS.map((d) => (
                      <option key={d.num} value={d.num}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Rombongan Belajar (Kelas)</label>
                <select
                  required
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
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
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Ruangan / Laboratorium</label>
                <select
                  value={formRoomId}
                  onChange={(e) => setFormRoomId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Gunakan Ruang Kelas Asli --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Catatan Pembelajaran</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Praktikum Kimia / Pembahasan Materi Mandiri"
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
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                >
                  Validasi & Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
