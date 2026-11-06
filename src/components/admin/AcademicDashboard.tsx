/**
 * Nusantara Education CMS - Dashboard Akademik Multi-Peran Terpadu
 * Phase 4 - Multi-Tenant SaaS, Kurikulum & Manajemen Akademik
 */

import React, { useState } from 'react';
import {
  School,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { RoleName } from '../../types';

interface AcademicDashboardProps {
  onNavigate: (view: any) => void;
}

export const AcademicDashboard: React.FC<AcademicDashboardProps> = ({ onNavigate }) => {
  const { user, activeTenant, userTenants, switchTenant } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || (Array.isArray(user?.roles) && user.roles.includes('SUPER_ADMIN'));
  const isKepsekOrAdmin = isSuperAdmin || user?.role === 'ADMIN_SEKOLAH' || user?.role === 'ADMIN' || user?.role === 'KEPALA_SEKOLAH' || user?.role === 'WAKIL_KEPALA_SEKOLAH' || user?.role === 'ADMIN_AKADEMIK';
  const isTeacher = user?.role === 'GURU' || (Array.isArray(user?.roles) && user.roles.includes('GURU'));
  const isHomeroom = user?.role === 'WALI_KELAS' || (Array.isArray(user?.roles) && user.roles.includes('WALI_KELAS'));
  const isStudent = user?.role === 'SISWA';
  const isParent = user?.role === 'ORANG_TUA';

  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();
  const currentAy = cmsStore.getActiveAcademicYear(tenantId);
  const currentTerm = cmsStore.getActiveAcademicTerm(tenantId);
  const classes = cmsStore.getAcademicClasses(tenantId, currentAy?.id);
  const subjects = cmsStore.getSubjects(tenantId);
  const teachers = cmsStore.getTeachers();
  const students = cmsStore.getStudents();
  const schedules = cmsStore.getScheduleItems({ tenantId, academicYearId: currentAy?.id, academicTermId: currentTerm?.id });
  const learningDocs = cmsStore.getLearningDocuments(tenantId);
  const calendarEvents = cmsStore.getAcademicCalendarEvents(tenantId);
  const subscription = cmsStore.getTenantSubscription(tenantId);

  // Perhitungan beban mengajar jika login sebagai Guru
  const teacherWorkload = isTeacher && user ? cmsStore.getTeacherWorkload(user.id, currentAy?.id) : null;
  const teacherSchedules = isTeacher && user ? schedules.filter((s) => s.teacherId === user.id) : [];
  const teacherDocs = isTeacher && user ? learningDocs.filter((d) => d.authorId === user.id) : [];

  // Data pending approval untuk Kepala Sekolah / Admin
  const pendingDocs = learningDocs.filter((d) => d.status === 'SUBMITTED');

  // Agenda kalender terdekat
  const upcomingEvents = calendarEvents.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header Institusi & Active Academic Term */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/20 text-white">
                <Building2 className="w-3.5 h-3.5" />
                {activeTenant?.category === 'KAMPUS' ? 'Perguruan Tinggi' : 'Institusi Pendidikan'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {currentAy?.name || '2026/2027'} — {currentTerm?.name || 'Semester Ganjil'}
              </span>
              {subscription && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Paket {subscription.tier}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeTenant?.name || 'SMA Negeri Nusantara Mandiri'}
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Selamat datang, <strong className="text-white">{user?.name}</strong>. Anda mengelola sistem akademik dengan peran <span className="underline decoration-sky-300 font-semibold">{user?.role}</span>.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('admin-schedules')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 transition shadow-sm"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              Lihat Jadwal
            </button>
            {isKepsekOrAdmin && (
              <button
                onClick={() => onNavigate('admin-learning-docs')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/50 hover:bg-blue-600 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition"
              >
                <FileText className="w-4 h-4" />
                Supervisi Modul ({pendingDocs.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {activeTenant?.category === 'KAMPUS' ? 'Mahasiswa Aktif' : 'Peserta Didik'}
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">{students.length}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Terdaftar di {classes.length} Rombel/Kelas
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {activeTenant?.category === 'KAMPUS' ? 'Dosen Pengampu' : 'Pendidik & Guru'}
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">{teachers.length}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Standar 24 Jam/Minggu</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mata Pelajaran / Kuliah
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">{subjects.length}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
            Kurikulum Merdeka & OBE
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sesi Jadwal Aktif
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">{schedules.length}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Bebas Bentrok
          </div>
        </div>
      </div>

      {/* Guru / Dosen: Workload Banner if applicable */}
      {isTeacher && teacherWorkload && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Beban Mengajar Guru (Standar 24 Jam Tatap Muka)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Total Mengajar Anda: <span className="text-blue-700">{teacherWorkload.totalHours} Jam/Minggu</span>
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {teacherWorkload.isWorkloadStandardMet
                  ? 'Beban mengajar Anda telah memenuhi kriteria sertifikasi pendidik (minimal 24 jam).'
                  : `Anda mengampu ${teacherWorkload.totalHours} jam. Perlu penambahan alokasi tugas mengajar untuk memenuhi kuota 24 jam.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                  teacherWorkload.isWorkloadStandardMet
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {teacherWorkload.isWorkloadStandardMet ? 'Memenuhi Standar' : 'Belum Memenuhi'}
              </span>
              <button
                onClick={() => onNavigate('admin-teaching-assignments')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
              >
                Detail Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dua Kolom: Jadwal & Agenda Kalender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Jadwal Pembelajaran */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {isTeacher ? 'Jadwal Mengajar Anda' : 'Jadwal Pembelajaran Terjadwal'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alokasi waktu kelas, ruang, dan guru pada semester aktif
              </p>
            </div>
            <button
              onClick={() => onNavigate('admin-schedules')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {(isTeacher ? teacherSchedules : schedules).slice(0, 5).map((sch) => {
              const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
              return (
                <div
                  key={sch.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/40 transition gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {days[sch.dayOfWeek]?.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sch.subjectName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{sch.className}</span> • Ruang {sch.roomCode || 'Kelas'} • Pengampu: {sch.teacherName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>
                </div>
              );
            })}
            {(isTeacher ? teacherSchedules : schedules).length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                Belum ada jadwal tersusun untuk semester ini.
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Kalender Akademik & Agenda Terdekat */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Agenda Kalender
            </h2>
            <button
              onClick={() => onNavigate('admin-academic-calendar')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Kalender Lengkap
            </button>
          </div>

          <div className="space-y-3.5">
            {upcomingEvents.map((ev) => {
              const start = new Date(ev.startDate);
              const dateStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
              return (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition">
                  <div
                    className="h-10 w-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold text-xs text-white"
                    style={{ backgroundColor: ev.color || '#3b82f6' }}
                  >
                    <span>{dateStr.split(' ')[0]}</span>
                    <span className="text-[10px] uppercase">{dateStr.split(' ')[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{ev.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ev.location || 'Kampus Utama'}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {ev.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links Menu Akademik */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Navigasi Cepat</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('admin-curriculum')}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition"
              >
                <BookOpen className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Kurikulum</span>
                <span className="text-[10px] text-slate-500">Merdeka & OBE</span>
              </button>
              <button
                onClick={() => onNavigate('admin-academic-structure')}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition"
              >
                <Compass className="w-4 h-4 text-indigo-600 mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Struktur</span>
                <span className="text-[10px] text-slate-500">Prodi & Rombel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
