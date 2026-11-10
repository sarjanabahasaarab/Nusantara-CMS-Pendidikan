import React, { useState } from 'react';
import { 
  Clock, CheckCircle, AlertTriangle, Users, Calendar, 
  Search, Filter, Plus, Save, UserCheck, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { StaffAttendance, AttendanceStatus } from '../../types';

interface StaffAttendanceManagementProps {
  onNavigate?: (nav: string) => void;
}

export const StaffAttendanceManagement: React.FC<StaffAttendanceManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const teachers = cmsDb.getTeachers(tenantId);
  const staffList = cmsDb.getStaff(tenantId);
  const allStaff = [
    ...teachers.map(t => ({ ...t, fullName: t.fullName || (t as any).name || 'Guru', role: 'GURU' })),
    ...staffList.map(s => ({ ...s, fullName: s.fullName || (s as any).name || 'Staf', role: 'STAFF' }))
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Form for manual entry / correction
  const [targetStaffId, setTargetStaffId] = useState<string>(allStaff[0]?.id || '');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('HADIR');
  const [manualClockIn, setManualClockIn] = useState<string>('07:15');
  const [manualClockOut, setManualClockOut] = useState<string>('15:30');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get attendances for selected date
  const attendances = cmsDb.getStaffAttendances(tenantId, { date: selectedDate });

  // Self check-in check
  const currentStaffProfile = allStaff.find(s => s.userId === user?.id);
  const myTodayAttendance = currentStaffProfile 
    ? attendances.find(a => a.staffId === currentStaffProfile.id)
    : undefined;

  const handleSelfClockIn = () => {
    if (!currentStaffProfile) {
      setMessage({ type: 'error', text: 'Profil staf Anda tidak ditemukan di sistem ini.' });
      return;
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const isLate = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 15);
    const lateMins = isLate ? (now.getHours() - 7) * 60 + (now.getMinutes() - 15) : 0;

    try {
      cmsDb.recordStaffAttendance(
        {
          tenantId,
          staffId: currentStaffProfile.id,
          staffType: currentStaffProfile.role === 'GURU' ? 'TEACHER' : 'STAFF',
          date: todayStr,
          status: isLate ? 'TERLAMBAT' : 'HADIR',
          clockIn: timeStr,
          lateMinutes: lateMins,
          notes: isLate ? 'Check-in mandiri (terlambat)' : 'Check-in mandiri tepat waktu'
        },
        user
      );
      setMessage({ type: 'success', text: `Berhasil Check-In pada pukul ${timeStr}` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal melakukan check-in' });
    }
  };

  const handleSelfClockOut = () => {
    if (!myTodayAttendance) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    try {
      cmsDb.recordStaffAttendance(
        {
          tenantId,
          staffId: myTodayAttendance.staffId,
          staffType: myTodayAttendance.staffType,
          date: todayStr,
          status: myTodayAttendance.status,
          clockIn: myTodayAttendance.clockIn,
          clockOut: timeStr,
          lateMinutes: myTodayAttendance.lateMinutes,
          notes: myTodayAttendance.notes ? `${myTodayAttendance.notes}; Clock-out ${timeStr}` : `Clock-out ${timeStr}`
        },
        user
      );
      setMessage({ type: 'success', text: `Berhasil Check-Out pada pukul ${timeStr}` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal melakukan check-out' });
    }
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const target = allStaff.find(s => s.id === targetStaffId);
    if (!target) return;

    try {
      cmsDb.recordStaffAttendance(
        {
          tenantId,
          staffId: target.id,
          staffType: target.role === 'GURU' ? 'TEACHER' : 'STAFF',
          date: selectedDate,
          status: manualStatus,
          clockIn: manualStatus === 'HADIR' || manualStatus === 'TERLAMBAT' ? manualClockIn : undefined,
          clockOut: manualStatus === 'HADIR' || manualStatus === 'TERLAMBAT' ? manualClockOut : undefined,
          notes: manualNotes
        },
        user
      );
      setShowManualModal(false);
      setMessage({ type: 'success', text: `Presensi manual untuk ${target.fullName} berhasil disimpan.` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan presensi manual' });
    }
  };

  const filteredStaff = allStaff.filter(st => {
    const matchSearch = st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.nip?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'ALL' || (roleFilter === 'TEACHER' ? st.role === 'GURU' : st.role !== 'GURU');
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            Presensi Guru & Tenaga Kependidikan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan jam kerja, log check-in/out harian, izin dinas, dan rekapitulasi kehadiran pendidik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Input Presensi Manual
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* QUICK CLOCK-IN CARD FOR CURRENT USER */}
      {currentStaffProfile && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" /> Presensi Mandiri Hari Ini
            </div>
            <h2 className="text-xl font-bold">{currentStaffProfile.fullName}</h2>
            <p className="text-slate-300 text-xs mt-1">
              NIP: {currentStaffProfile.nip || '-'} • Status Jam Masuk Standar: 07:15 WIB
            </p>
            {myTodayAttendance && (
              <div className="mt-3 flex items-center gap-4 text-xs font-medium bg-white/10 px-3 py-2 rounded-lg w-fit">
                <span>Masuk: <b className="text-emerald-400">{myTodayAttendance.clockIn || '-'}</b></span>
                <span>Pulang: <b className="text-indigo-400">{myTodayAttendance.clockOut || 'Belum'}</b></span>
                <span>Status: <b className="text-amber-300">{myTodayAttendance.status}</b></span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!myTodayAttendance?.clockIn ? (
              <button
                onClick={handleSelfClockIn}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Check-In Sekarang
              </button>
            ) : !myTodayAttendance?.clockOut ? (
              <button
                onClick={handleSelfClockOut}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 transition flex items-center gap-2"
              >
                <Clock className="w-4 h-4" /> Check-Out Pulang
              </button>
            ) : (
              <div className="text-xs bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-lg font-semibold">
                ✓ Anda telah menyelesaikan presensi hari ini
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori Staf</label>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Pendidik & Tendik</option>
              <option value="TEACHER">Guru Saja</option>
              <option value="STAFF">Tenaga Kependidikan Saja</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Pencarian</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau NIP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* STAFF ATTENDANCE TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4 w-32">Peran</th>
                <th className="py-3 px-4 w-28 text-center">Jam Masuk</th>
                <th className="py-3 px-4 w-28 text-center">Jam Pulang</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4">Catatan / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    Tidak ada staf yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((st, idx) => {
                  const att = attendances.find(a => a.staffId === st.id);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{st.fullName}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{st.nip || 'Non-PNS'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          st.role === 'GURU' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {st.role === 'GURU' ? 'Guru' : 'Tenaga Kependidikan'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium">
                        {att?.clockIn ? (
                          <span className={att.lateMinutes && att.lateMinutes > 0 ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                            {att.clockIn}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-800">
                        {att?.clockOut || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {att ? (
                          <span className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                            att.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                            att.status === 'TERLAMBAT' ? 'bg-amber-100 text-amber-800' :
                            att.status === 'DINAS' ? 'bg-purple-100 text-purple-800' :
                            att.status === 'SAKIT' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {att.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum Presensi</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {att?.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL ENTRY MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Input Presensi Manual Guru / Staf</h3>
            <form onSubmit={handleSaveManual} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Guru / Staf</label>
                <select
                  value={targetStaffId}
                  onChange={e => setTargetStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {allStaff.map(st => (
                    <option key={st.id} value={st.id}>{st.fullName} ({st.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Kehadiran</label>
                <select
                  value={manualStatus}
                  onChange={e => setManualStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="HADIR">HADIR</option>
                  <option value="TERLAMBAT">TERLAMBAT</option>
                  <option value="DINAS">DINAS LUAR</option>
                  <option value="SAKIT">SAKIT</option>
                  <option value="IZIN">IZIN</option>
                  <option value="ALPA">ALPA</option>
                  <option value="DISPENSASI">DISPENSASI</option>
                </select>
              </div>

              {(manualStatus === 'HADIR' || manualStatus === 'TERLAMBAT') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Masuk</label>
                    <input
                      type="time"
                      value={manualClockIn}
                      onChange={e => setManualClockIn(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Pulang</label>
                    <input
                      type="time"
                      value={manualClockOut}
                      onChange={e => setManualClockOut(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan / Alasan Koreksi</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  placeholder="Contoh: Koreksi dinas luar di Dinas Pendidikan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
