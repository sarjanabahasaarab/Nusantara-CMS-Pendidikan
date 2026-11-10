import React, { useState } from 'react';
import { 
  FileText, CheckCircle, XCircle, Clock, AlertCircle, 
  Search, Filter, Plus, User, ShieldAlert, Check
} from 'lucide-react';
import { cmsDb } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { LeaveRequest, LeaveRequestType, LeaveRequestStatus } from '../../types';

interface LeaveRequestsManagementProps {
  onNavigate?: (nav: string) => void;
}

export const LeaveRequestsManagement: React.FC<LeaveRequestsManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const currentTenant = cmsDb.getCurrentTenant();
  const tenantId = currentTenant?.id || '';

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New leave request form state
  const students = cmsDb.getStudents(tenantId);
  const teachers = cmsDb.getTeachers(tenantId);
  const staff = cmsDb.getStaff(tenantId);

  const [applicantType, setApplicantType] = useState<'STUDENT' | 'TEACHER' | 'STAFF'>('STUDENT');
  const [targetId, setTargetId] = useState<string>(students[0]?.id || '');
  const [newType, setNewType] = useState<LeaveRequestType>('SAKIT');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');
  const [docUrl, setDocUrl] = useState<string>('');

  const requests = cmsDb.getLeaveRequests(tenantId);

  const filteredRequests = requests.filter(req => {
    const matchStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const matchType = filterType === 'ALL' || req.type === filterType;
    const matchSearch = req.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const handleApprove = (req: LeaveRequest) => {
    if (!user) return;
    try {
      cmsDb.updateLeaveRequestStatus(
        req.id,
        'DISETUJUI',
        approvalNotes || 'Disetujui oleh validator sekolah.',
        user
      );
      setSelectedRequest(null);
      setApprovalNotes('');
      setMessage({ type: 'success', text: 'Permohonan izin berhasil DISETUJUI dan dicatat ke absensi!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memproses permohonan' });
    }
  };

  const handleReject = (req: LeaveRequest) => {
    if (!user) return;
    if (!approvalNotes.trim()) {
      setMessage({ type: 'error', text: 'Harap cantumkan alasan penolakan pada catatan.' });
      return;
    }
    try {
      cmsDb.updateLeaveRequestStatus(
        req.id,
        'DITOLAK',
        approvalNotes,
        user
      );
      setSelectedRequest(null);
      setApprovalNotes('');
      setMessage({ type: 'success', text: 'Permohonan izin telah DITOLAK.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memproses permohonan' });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      cmsDb.createLeaveRequest(
        {
          tenantId,
          studentId: applicantType === 'STUDENT' ? targetId : undefined,
          teacherId: applicantType === 'TEACHER' ? targetId : undefined,
          staffId: applicantType === 'STAFF' ? targetId : undefined,
          type: newType,
          startDate,
          endDate,
          reason,
          documentUrl: docUrl || undefined
        },
        user
      );
      setShowCreateModal(false);
      setReason('');
      setDocUrl('');
      setMessage({ type: 'success', text: 'Permohonan izin baru berhasil diajukan.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal membuat permohonan izin' });
    }
  };

  const getApplicantName = (req: LeaveRequest) => {
    if (req.studentId) {
      const s = students.find(x => x.id === req.studentId);
      return s ? `${s.fullName} (Siswa)` : 'Siswa';
    }
    if (req.teacherId) {
      const t = teachers.find(x => x.id === req.teacherId);
      return t ? `${t.fullName} (Guru)` : 'Guru';
    }
    if (req.staffId) {
      const st = staff.find(x => x.id === req.staffId);
      return st ? `${st.fullName} (Staf)` : 'Staf';
    }
    return 'Pemohon';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Pengajuan Izin & Cuti
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola surat izin sakit, permohonan dispensasi siswa, cuti guru, dan dinas luar institusi.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Ajukan Surat Izin Baru
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Status Pengajuan</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU">Menunggu Persetujuan</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Jenis Izin</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="SAKIT">Sakit</option>
              <option value="IZIN">Izin Keperluan</option>
              <option value="DISPENSASI">Dispensasi Lomba</option>
              <option value="CUTI">Cuti Resmi</option>
              <option value="DINAS">Dinas Luar</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Pencarian Alasan</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari alasan izin..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* REQUESTS LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Pemohon</th>
                <th className="py-3 px-4 w-28">Jenis Izin</th>
                <th className="py-3 px-4 w-44">Rentang Tanggal</th>
                <th className="py-3 px-4">Alasan & Dokumen</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    Tidak ada pengajuan izin yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{getApplicantName(req)}</div>
                      <div className="text-[11px] text-slate-500">ID: {req.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        req.type === 'SAKIT' ? 'bg-blue-100 text-blue-800' :
                        req.type === 'DISPENSASI' ? 'bg-purple-100 text-purple-800' :
                        req.type === 'DINAS' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <div>{req.startDate}</div>
                      <div className="text-[10px] text-slate-400">s/d {req.endDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{req.reason}</div>
                      {req.documentUrl && (
                        <a
                          href={req.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-1"
                        >
                          <FileText className="w-3 h-3" /> Lampiran Surat / Bukti Dokter
                        </a>
                      )}
                      {req.approverNotes && (
                        <div className="text-[11px] text-slate-500 mt-1 italic">
                          Catatan Validator: {req.approverNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 ${
                        req.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'DITOLAK' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status === 'DISETUJUI' && <CheckCircle className="w-3 h-3" />}
                        {req.status === 'DITOLAK' && <XCircle className="w-3 h-3" />}
                        {req.status === 'MENUNGGU' && <Clock className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {req.status === 'MENUNGGU' ? (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setApprovalNotes('');
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-xs transition"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW / APPROVAL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Verifikasi Pengajuan Izin</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-xs">
              <div><b>Pemohon:</b> {getApplicantName(selectedRequest)}</div>
              <div><b>Jenis Izin:</b> {selectedRequest.type}</div>
              <div><b>Tanggal:</b> {selectedRequest.startDate} sampai {selectedRequest.endDate}</div>
              <div><b>Alasan:</b> {selectedRequest.reason}</div>
              {selectedRequest.documentUrl && (
                <div>
                  <b>Lampiran:</b>{' '}
                  <a href={selectedRequest.documentUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                    Buka Dokumen Bukti
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Validator (Wajib jika menolak)
              </label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                placeholder="Contoh: Disetujui, harap menjaga kesehatan / Ditolak karena tidak melampirkan surat dokter..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleReject(selectedRequest)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Tolak Izin
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedRequest)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Setujui Izin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LEAVE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Buat Permohonan Izin / Cuti Baru</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Pemohon</label>
                <select
                  value={applicantType}
                  onChange={e => {
                    const val = e.target.value as any;
                    setApplicantType(val);
                    if (val === 'STUDENT') setTargetId(students[0]?.id || '');
                    if (val === 'TEACHER') setTargetId(teachers[0]?.id || '');
                    if (val === 'STAFF') setTargetId(staff[0]?.id || '');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="STUDENT">Siswa</option>
                  <option value="TEACHER">Guru</option>
                  <option value="STAFF">Tenaga Kependidikan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Orang</label>
                <select
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {applicantType === 'STUDENT' && students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.nisn || '-'})</option>
                  ))}
                  {applicantType === 'TEACHER' && teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                  {applicantType === 'STAFF' && staff.map(st => (
                    <option key={st.id} value={st.id}>{st.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Izin</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as LeaveRequestType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="SAKIT">Sakit</option>
                  <option value="IZIN">Izin Keperluan</option>
                  <option value="DISPENSASI">Dispensasi Kegiatan / Lomba</option>
                  <option value="CUTI">Cuti Resmi</option>
                  <option value="DINAS">Dinas Luar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mulai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Izin</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Jelaskan alasan izin secara rinci..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Surat Dokter / Lampiran (Opsional)</label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={e => setDocUrl(e.target.value)}
                  placeholder="https://... atau /documents/surat-sakit.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Ajukan Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
