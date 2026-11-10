import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Clock, AlertTriangle, Users, 
  Search, Filter, Save, Printer, FileText, Check, X, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { AttendanceStatus } from '../../types';

interface StudentAttendanceManagementProps {
  onNavigate?: (nav: string) => void;
}

export const StudentAttendanceManagement: React.FC<StudentAttendanceManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const classes = cmsDb.getClasses(tenantId);
  const subjects = cmsDb.getSubjects(tenantId);
  const academicYears = cmsDb.getAcademicYears(tenantId);
  const activeYear = academicYears.find(y => y.isActive) || academicYears[0];

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(''); // empty for daily
  const [sessionType, setSessionType] = useState<'HARIAN' | 'MATA_PELAJARAN'>('HARIAN');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [topic, setTopic] = useState<string>('Pertemuan Reguler');

  // View mode: 'entry' or 'recap'
  const [viewMode, setViewMode] = useState<'entry' | 'recap'>('entry');
  const [recapPeriod, setRecapPeriod] = useState<'MONTHLY' | 'SEMESTER'>('MONTHLY');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active student roster for selected class
  const classStudents = cmsDb.getStudents(tenantId).filter(s => s.classId === selectedClassId);
  
  // Existing session if any
  const existingSessions = cmsDb.getAttendanceSessions(tenantId, {
    classId: selectedClassId,
    date: selectedDate,
    sessionType: sessionType
  });
  const activeSession = existingSessions.find(s => 
    sessionType === 'HARIAN' || (s.subjectId === selectedSubjectId && s.periodNumber === periodNumber)
  );

  // Local state for attendance records
  const existingAttendances = activeSession 
    ? cmsDb.getStudentAttendances(tenantId, { sessionId: activeSession.id })
    : [];

  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; notes: string; minutesLate?: number }>>(() => {
    const map: Record<string, { status: AttendanceStatus; notes: string; minutesLate?: number }> = {};
    classStudents.forEach(st => {
      const found = existingAttendances.find(a => a.studentId === st.id);
      map[st.id] = {
        status: found ? found.status : 'HADIR',
        notes: found ? (found.notes || '') : '',
        minutesLate: found?.minutesLate
      };
    });
    return map;
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // When class or session changes, reload map
  React.useEffect(() => {
    const map: Record<string, { status: AttendanceStatus; notes: string; minutesLate?: number }> = {};
    classStudents.forEach(st => {
      const found = existingAttendances.find(a => a.studentId === st.id);
      map[st.id] = {
        status: found ? found.status : 'HADIR',
        notes: found ? (found.notes || '') : '',
        minutesLate: found?.minutesLate
      };
    });
    setAttendanceMap(map);
  }, [selectedClassId, selectedDate, selectedSubjectId, sessionType, periodNumber, activeSession?.id]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        minutesLate: status === 'TERLAMBAT' ? (prev[studentId]?.minutesLate || 15) : undefined
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleMinutesLateChange = (studentId: string, minutes: number) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        minutesLate: minutes
      }
    }));
  };

  const handleSetAllStatus = (status: AttendanceStatus) => {
    setAttendanceMap(prev => {
      const next = { ...prev };
      classStudents.forEach(st => {
        next[st.id] = {
          ...next[st.id],
          status,
          minutesLate: status === 'TERLAMBAT' ? 15 : undefined
        };
      });
      return next;
    });
  };

  const handleSaveAttendance = () => {
    if (!user) return;
    try {
      let sessionId = activeSession?.id;

      if (!sessionId) {
        // Create session
        const newSession = cmsDb.createAttendanceSession(
          {
            tenantId,
            classId: selectedClassId,
            subjectId: sessionType === 'MATA_PELAJARAN' ? selectedSubjectId : undefined,
            teacherId: user.id,
            date: selectedDate,
            sessionType,
            periodNumber: sessionType === 'MATA_PELAJARAN' ? periodNumber : undefined,
            academicYearId: activeYear?.id,
            semesterId: 'smt-2024-genap',
            title: sessionType === 'HARIAN' ? `Absensi Harian - ${selectedDate}` : `PBM: ${topic}`,
            topic: topic,
            isLocked: false
          },
          undefined,
          user
        );
        sessionId = newSession.id;
      }

      // Record attendances
      const records = classStudents.map(st => ({
        studentId: st.id,
        status: attendanceMap[st.id]?.status || 'HADIR',
        notes: attendanceMap[st.id]?.notes,
        minutesLate: attendanceMap[st.id]?.minutesLate
      }));

      cmsDb.recordStudentAttendanceBatch(tenantId, sessionId, records, user);
      setMessage({ type: 'success', text: 'Data presensi berhasil disimpan ke sistem!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan presensi' });
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Filtered students for search
  const filteredStudents = classStudents.filter(st => 
    st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.nisn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.nis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status counters
  const counts = Object.values(attendanceMap).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-indigo-600" />
            Presensi & Absensi Siswa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola presensi harian per kelas, absensi mata pelajaran, rekapitulasi kehadiran, serta keterlambatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('entry')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'entry' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Input Presensi
          </button>
          <button
            onClick={() => setViewMode('recap')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'recap' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rekap Kehadiran
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* FILTER & CONFIGURATION BAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Kelas</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Presensi</label>
          <select
            value={sessionType}
            onChange={e => setSessionType(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="HARIAN">Presensi Harian (Wali Kelas / Piket)</option>
            <option value="MATA_PELAJARAN">Presensi Mata Pelajaran (Guru Mapel)</option>
          </select>
        </div>

        {sessionType === 'MATA_PELAJARAN' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {viewMode === 'entry' ? (
        <>
          {/* Summary Badges & Quick Action */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ringkasan:</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                Hadir: {counts['HADIR'] || 0}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                Sakit: {counts['SAKIT'] || 0}
              </span>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                Izin: {counts['IZIN'] || 0}
              </span>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold">
                Alpa: {counts['ALPA'] || 0}
              </span>
              <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold">
                Terlambat: {counts['TERLAMBAT'] || 0}
              </span>
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold">
                Dispensasi: {counts['DISPENSASI'] || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Tandai semua:</span>
              <button
                onClick={() => handleSetAllStatus('HADIR')}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition"
              >
                Hadir Semua
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">
                  Daftar Siswa Kelas {selectedClass?.name || '-'} ({classStudents.length} Siswa)
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa atau NISN..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4 w-32">NISN / NIS</th>
                    <th className="py-3 px-4 min-w-[320px]">Status Kehadiran</th>
                    <th className="py-3 px-4 w-40">Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                        Tidak ada data siswa di kelas ini.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => {
                      const record = attendanceMap[st.id] || { status: 'HADIR', notes: '' };
                      return (
                        <tr key={st.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{st.fullName}</div>
                            <div className="text-xs text-slate-500">{st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-slate-600">
                            {st.nisn || st.nis || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                { status: 'HADIR', label: 'Hadir', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', active: 'bg-emerald-600 text-white' },
                                { status: 'SAKIT', label: 'Sakit', bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100', active: 'bg-blue-600 text-white' },
                                { status: 'IZIN', label: 'Izin', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100', active: 'bg-amber-600 text-white' },
                                { status: 'ALPA', label: 'Alpa', bg: 'bg-rose-50 text-rose-700 hover:bg-rose-100', active: 'bg-rose-600 text-white' },
                                { status: 'TERLAMBAT', label: 'Terlambat', bg: 'bg-orange-50 text-orange-700 hover:bg-orange-100', active: 'bg-orange-600 text-white' },
                                { status: 'DISPENSASI', label: 'Dispen', bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100', active: 'bg-purple-600 text-white' }
                              ].map(btn => (
                                <button
                                  key={btn.status}
                                  type="button"
                                  onClick={() => handleStatusChange(st.id, btn.status as AttendanceStatus)}
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                                    record.status === btn.status ? btn.active : btn.bg
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>

                            {record.status === 'TERLAMBAT' && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-orange-800">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Terlambat:</span>
                                <input
                                  type="number"
                                  value={record.minutesLate || 15}
                                  onChange={e => handleMinutesLateChange(st.id, parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-0.5 border border-orange-300 rounded text-center text-xs"
                                  min={1}
                                  max={300}
                                />
                                <span>menit</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Catatan..."
                              value={record.notes}
                              onChange={e => handleNotesChange(st.id, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {activeSession ? (
                  <span className="text-indigo-600 font-medium">
                    ✓ Sesi presensi ini telah tersimpan (Terakhir diperbarui)
                  </span>
                ) : (
                  <span>Sesi baru akan dibuat saat Anda menyimpan data ini.</span>
                )}
              </div>

              <button
                onClick={handleSaveAttendance}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                Simpan Presensi Kelas
              </button>
            </div>
          </div>
        </>
      ) : (
        /* RECAPITULATION VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Rekapitulasi Presensi — Kelas {selectedClass?.name || '-'}
              </h3>
              <p className="text-xs text-slate-500">
                Tahun Ajaran: {activeYear?.name || '-'} | Periode: {recapPeriod === 'MONTHLY' ? 'Bulanan' : 'Semester'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={recapPeriod}
                onChange={e => setRecapPeriod(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
              >
                <option value="MONTHLY">Rekap Bulanan</option>
                <option value="SEMESTER">Rekap Semester</option>
              </select>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                Cetak Rekap
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3 w-28">NISN</th>
                  <th className="py-2.5 px-3 text-center bg-emerald-50 text-emerald-800">Hadir</th>
                  <th className="py-2.5 px-3 text-center bg-blue-50 text-blue-800">Sakit</th>
                  <th className="py-2.5 px-3 text-center bg-amber-50 text-amber-800">Izin</th>
                  <th className="py-2.5 px-3 text-center bg-rose-50 text-rose-800">Alpa</th>
                  <th className="py-2.5 px-3 text-center bg-orange-50 text-orange-800">Terlambat</th>
                  <th className="py-2.5 px-3 text-center bg-purple-50 text-purple-800">Dispen</th>
                  <th className="py-2.5 px-3 text-center font-bold">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.map((st, i) => {
                  const studentAtts = cmsDb.getStudentAttendances(tenantId, { studentId: st.id });
                  const hadir = studentAtts.filter(a => a.status === 'HADIR').length;
                  const sakit = studentAtts.filter(a => a.status === 'SAKIT').length;
                  const izin = studentAtts.filter(a => a.status === 'IZIN').length;
                  const alpa = studentAtts.filter(a => a.status === 'ALPA').length;
                  const terlambat = studentAtts.filter(a => a.status === 'TERLAMBAT').length;
                  const dispen = studentAtts.filter(a => a.status === 'DISPENSASI').length;
                  const total = studentAtts.length || 1;
                  const percent = Math.round(((hadir + terlambat + dispen) / total) * 100);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{st.fullName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{st.nisn || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{hadir}</td>
                      <td className="py-2.5 px-3 text-center text-blue-700">{sakit}</td>
                      <td className="py-2.5 px-3 text-center text-amber-700">{izin}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-rose-700">{alpa}</td>
                      <td className="py-2.5 px-3 text-center text-orange-700">{terlambat}</td>
                      <td className="py-2.5 px-3 text-center text-purple-700">{dispen}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                          percent >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          percent >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {percent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
