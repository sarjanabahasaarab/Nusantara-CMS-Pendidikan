import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, CheckCircle, 
  Users, Award, Calendar, Download, Printer, Filter
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';

interface AcademicReportsViewProps {
  onNavigate?: (nav: string) => void;
}

export const AcademicReportsView: React.FC<AcademicReportsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const classes = cmsDb.getClasses(tenantId);
  const subjects = cmsDb.getSubjects(tenantId);
  const students = cmsDb.getStudents(tenantId);
  const teachers = cmsDb.getTeachers(tenantId);
  const components = cmsDb.getAssessmentComponents(tenantId);
  const attendances = cmsDb.getStudentAttendances(tenantId);
  const leaveRequests = cmsDb.getLeaveRequests(tenantId);

  // Statistics
  const totalHadir = attendances.filter(a => a.status === 'HADIR').length;
  const totalTerlambat = attendances.filter(a => a.status === 'TERLAMBAT').length;
  const totalSakit = attendances.filter(a => a.status === 'SAKIT').length;
  const totalIzin = attendances.filter(a => a.status === 'IZIN').length;
  const totalAlpa = attendances.filter(a => a.status === 'ALPA').length;
  const totalRecords = attendances.length || 1;
  const avgAttendancePercent = Math.round(((totalHadir + totalTerlambat) / totalRecords) * 100);

  // Ungraded checks
  const ungradedComponents = components.filter(c => {
    const ass = cmsDb.getStudentAssessments(tenantId, { componentId: c.id });
    return ass.length === 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Laporan Eksekutif & Analitik Akademik
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dasbor statistik kehadiran siswa & pendidik, distribusi ketuntasan capaian nilai, dan peringatan nilai yang belum masuk.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan Eksekutif
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Rata-rata Presensi Siswa</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{avgAttendancePercent}%</span>
            <span className="text-xs text-slate-400">Kehadiran Efektif</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${avgAttendancePercent}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Peserta Didik</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{students.length}</span>
            <span className="text-xs text-slate-400">Terdaftar Aktif</span>
          </div>
          <div className="text-[11px] text-slate-500">{classes.length} Rombel / Kelas Aktif</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Komponen Asesmen</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-600">{components.length}</span>
            <span className="text-xs text-slate-400">Instrumen Terbit</span>
          </div>
          <div className="text-[11px] text-slate-500">{ungradedComponents.length} Menunggu Penginputan</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Pengajuan Izin Masuk</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">{leaveRequests.length}</span>
            <span className="text-xs text-slate-400">Total Surat</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {leaveRequests.filter(l => l.status === 'MENUNGGU').length} Perlu Verifikasi
          </div>
        </div>
      </div>

      {/* UNGRADED ALERTS SECTION */}
      {ungradedComponents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Peringatan: Komponen Penilaian Belum Ada Nilai Masuk ({ungradedComponents.length} Komponen)
          </div>
          <p className="text-xs text-amber-800">
            Daftar komponen penilaian di bawah ini telah dibuat namun belum memiliki rekaman nilai siswa dari guru pengampu:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {ungradedComponents.map(c => {
              const cls = classes.find(x => x.id === c.classId);
              const sb = subjects.find(x => x.id === c.subjectId);
              return (
                <div key={c.id} className="bg-white p-2.5 rounded border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="text-slate-500 text-[11px] ml-2">({cls?.name || '-'} • {sb?.name || '-'})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Belum Diinput
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BREAKDOWN TABLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Komposisi Kehadiran Siswa
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-emerald-50 text-emerald-900">
              <span className="font-medium">Hadir Tepat Waktu</span>
              <span className="font-bold font-mono">{totalHadir} ({Math.round((totalHadir / totalRecords) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-orange-50 text-orange-900">
              <span className="font-medium">Terlambat Masuk</span>
              <span className="font-bold font-mono">{totalTerlambat} ({Math.round((totalTerlambat / totalRecords) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-blue-50 text-blue-900">
              <span className="font-medium">Sakit Berizin</span>
              <span className="font-bold font-mono">{totalSakit} ({Math.round((totalSakit / totalRecords) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-amber-50 text-amber-900">
              <span className="font-medium">Izin Keperluan Keluarga</span>
              <span className="font-bold font-mono">{totalIzin} ({Math.round((totalIzin / totalRecords) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-rose-50 text-rose-900">
              <span className="font-medium">Tanpa Keterangan (Alpa)</span>
              <span className="font-bold font-mono">{totalAlpa} ({Math.round((totalAlpa / totalRecords) * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Academic Performance Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" /> Ringkasan Kelas & Guru Pengampu
          </h3>
          <div className="space-y-2 text-xs">
            {classes.slice(0, 5).map(c => {
              const count = students.filter(s => s.classId === c.id).length;
              return (
                <div key={c.id} className="flex items-center justify-between p-2 rounded border border-slate-100 hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2">{(c as any).level || (c as any).gradeLevelId || 'Kelas'} • {(c as any).major || c.code || 'Reguler'}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-700">{count} Siswa</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
