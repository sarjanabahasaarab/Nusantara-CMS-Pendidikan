import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, Award, FileText, CheckCircle, 
  AlertTriangle, MessageCircle, Send, Check, ShieldAlert
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { StudentProfile } from '../../types';

interface ParentAcademicPortalProps {
  onNavigate?: (nav: string) => void;
}

export const ParentAcademicPortal: React.FC<ParentAcademicPortalProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const allStudents = cmsDb.getStudents(tenantId);
  // Find linked children for this parent or fallback to first student
  const parentChildren = allStudents.filter(s => s.parentId === user?.id);
  const activeChildren = parentChildren.length > 0 ? parentChildren : allStudents.slice(0, 2);

  const [selectedChildId, setSelectedChildId] = useState<string>(activeChildren[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'attendance' | 'report' | 'excuse'>('attendance');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Excuse letter form
  const [excuseType, setExcuseType] = useState<any>('SAKIT');
  const [excuseStart, setExcuseStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [excuseEnd, setExcuseEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [excuseReason, setExcuseReason] = useState<string>('');
  const [excuseDocUrl, setExcuseDocUrl] = useState<string>('');

  const currentChild = activeChildren.find(c => c.id === selectedChildId) || activeChildren[0];

  // Attendances for current child
  const attendances = currentChild 
    ? cmsDb.getStudentAttendances(tenantId, { studentId: currentChild.id })
    : [];

  // Report cards
  const reportCards = currentChild
    ? cmsDb.getReportCards(tenantId, { studentId: currentChild.id })
    : [];
  const activeReport = reportCards[0];

  const handleSendExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentChild) return;

    try {
      cmsDb.createLeaveRequest(
        {
          tenantId,
          studentId: currentChild.id,
          type: excuseType,
          startDate: excuseStart,
          endDate: excuseEnd,
          reason: `[Dari Orang Tua/Wali] ${excuseReason}`,
          documentUrl: excuseDocUrl || undefined
        },
        user
      );
      setExcuseReason('');
      setExcuseDocUrl('');
      setMessage({ type: 'success', text: `Surat permohonan izin untuk ${currentChild.fullName} berhasil dikirim ke sekolah!` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengirimkan surat izin' });
    }
  };

  if (!currentChild) {
    return (
      <div className="bg-white p-12 text-center text-slate-500 rounded-xl border border-slate-200">
        Data anak / peserta didik belum terhubung dengan akun orang tua ini.
      </div>
    );
  }

  // Summary stats
  const hadir = attendances.filter(a => a.status === 'HADIR').length;
  const terlambat = attendances.filter(a => a.status === 'TERLAMBAT').length;
  const sakit = attendances.filter(a => a.status === 'SAKIT').length;
  const izin = attendances.filter(a => a.status === 'IZIN').length;
  const alpa = attendances.filter(a => a.status === 'ALPA').length;
  const totalAtt = attendances.length || 1;
  const presencePercent = Math.round(((hadir + terlambat) / totalAtt) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Portal Orang Tua & Wali Murid
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            Pemantauan Akademik Ananda
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau kehadiran harian secara real-time, keterlambatan, buku rapor, dan kirim surat izin dokter.
          </p>
        </div>

        {/* CHILD SWITCHER */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Pilih Putra/Putri:</label>
          <select
            value={selectedChildId}
            onChange={e => setSelectedChildId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800"
          >
            {activeChildren.map(c => (
              <option key={c.id} value={c.id}>{c.fullName} ({c.classId})</option>
            ))}
          </select>
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

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'attendance' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Presensi & Kehadiran
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'report' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Buku Rapor Ananda
        </button>
        <button
          onClick={() => setActiveTab('excuse')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'excuse' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Kirim Surat Izin / Sakit
        </button>
      </div>

      {/* ATTENDANCE TRACKING TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Persentase Kehadiran</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{presencePercent}%</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{hadir} hari hadir tepat waktu</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Keterlambatan</span>
              <div className="text-2xl font-bold font-mono text-orange-600 mt-1">{terlambat} Kali</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Tercatat di gerbang sekolah</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Sakit / Izin</span>
              <div className="text-2xl font-bold font-mono text-blue-600 mt-1">{sakit + izin} Hari</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Surat resmi terlampir</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Tanpa Keterangan</span>
              <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{alpa} Hari</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Alpa</p>
            </div>
          </div>

          {/* ATTENDANCE LOG */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Log Presensi Harian {currentChild.fullName}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        Belum ada catatan presensi.
                      </td>
                    </tr>
                  ) : (
                    attendances.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-700">{att.date}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            att.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                            att.status === 'TERLAMBAT' ? 'bg-orange-100 text-orange-800' :
                            att.status === 'SAKIT' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{att.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CARD VIEW */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          {activeReport ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Rapor Hasil Belajar Ananda</h3>
                  <p className="text-xs text-slate-500">Status Pengesahan: <b className="text-emerald-700">{activeReport.status}</b></p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Cetak / Download PDF
                </button>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold">
                    <th className="py-2 px-3">Mata Pelajaran</th>
                    <th className="py-2 px-3 text-center">Nilai</th>
                    <th className="py-2 px-3 text-center">Huruf</th>
                    <th className="py-2 px-3">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(activeReport.grades || (activeReport.items as any) || []).map((g: any) => (
                    <tr key={g.subjectId}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{g.subjectName}</td>
                      <td className="py-2 px-3 text-center font-bold text-indigo-700 font-mono">{g.finalScore}</td>
                      <td className="py-2 px-3 text-center font-bold">{g.letterGrade}</td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">{g.competencyDescription || g.competencyAchievement || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Homeroom Notes */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1 text-xs">
                <span className="font-bold text-slate-800">Catatan Khusus Wali Kelas:</span>
                <p className="italic text-slate-700">{activeReport.homeroomTeacherNotes || (activeReport as any).homeroomNotes || '-'}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada buku rapor resmi yang disahkan untuk ananda semester ini.
            </div>
          )}
        </div>
      )}

      {/* EXCUSE LETTER SUBMISSION */}
      {activeTab === 'excuse' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-lg mx-auto">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Surat Izin / Keterangan Tidak Masuk Sekolah</h3>
            <p className="text-xs text-slate-500 mt-1">
              Surat ini akan langsung masuk ke dasbor wali kelas dan tercatat resmi pada sistem presensi.
            </p>
          </div>

          <form onSubmit={handleSendExcuse} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Ketidakhadiran</label>
              <select
                value={excuseType}
                onChange={e => setExcuseType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="SAKIT">Ananda Sedang Sakit</option>
                <option value="IZIN">Izin Keperluan Keluarga Mendesak</option>
                <option value="DISPENSASI">Dispensasi Mengikuti Lomba Luar</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mulai Tanggal</label>
                <input
                  type="date"
                  required
                  value={excuseStart}
                  onChange={e => setExcuseStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  required
                  value={excuseEnd}
                  onChange={e => setExcuseEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alasan / Penjelasan Orang Tua</label>
              <textarea
                rows={3}
                required
                value={excuseReason}
                onChange={e => setExcuseReason(e.target.value)}
                placeholder="Mohon maaf ananda tidak dapat masuk sekolah dikarenakan..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL Surat Dokter / Bukti (Opsional)</label>
              <input
                type="url"
                value={excuseDocUrl}
                onChange={e => setExcuseDocUrl(e.target.value)}
                placeholder="https://... atau upload foto surat dokter"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
            >
              Kirim Surat Izin Resmi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
