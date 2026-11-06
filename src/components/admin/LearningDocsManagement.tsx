/**
 * Nusantara Education CMS - Dokumen Pembelajaran (Silabus, RPP, Modul Ajar, RPS)
 * Phase 4 - Instructional Design Workflow & Supervisor Approval Engine
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  MessageSquare,
  Award,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { cmsStore } from '../../lib/db';
import { LearningDocument, Subject } from '../../types';

interface LearningDocsManagementProps {
  onNavigate: (view: any) => void;
}

export const LearningDocsManagement: React.FC<LearningDocsManagementProps> = ({ onNavigate }) => {
  const { user, activeTenant } = useAuth();
  const tenantId = activeTenant?.id || cmsStore.getActiveTenantId();

  const isSupervisor =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN_SEKOLAH' ||
    user?.role === 'ADMIN' ||
    user?.role === 'KEPALA_SEKOLAH' ||
    user?.role === 'WAKIL_KEPALA_SEKOLAH';

  const [docs, setDocs] = useState<LearningDocument[]>(cmsStore.getLearningDocuments(tenantId));
  const [subjects] = useState<Subject[]>(cmsStore.getSubjects(tenantId));

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<LearningDocument | null>(null);

  // Form State
  const [formType, setFormType] = useState<'MODUL_AJAR' | 'RPP' | 'SILABUS' | 'RPS'>('MODUL_AJAR');
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formGrade, setFormGrade] = useState('X (Fase E)');
  const [formSummary, setFormSummary] = useState('');
  const [formAlokasi, setFormAlokasi] = useState('4 x 45 Menit');
  const [formLangkah, setFormLangkah] = useState('');

  // Review Form State
  const [revisionNotes, setRevisionNotes] = useState('');

  const refreshData = () => {
    setDocs(cmsStore.getLearningDocuments(tenantId));
  };

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenCreate = () => {
    setFormType('MODUL_AJAR');
    setFormTitle('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormGrade('X (Fase E)');
    setFormSummary('');
    setFormAlokasi('4 x 45 Menit');
    setFormLangkah('1. Kegiatan Pendahuluan: Apersepsi dan motivasi kontekstual\n2. Kegiatan Inti: Eksplorasi pemecahan masalah kolaboratif\n3. Penutup: Refleksi dan asesmen formatif');
    setShowCreateModal(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === formSubjectId);
    if (!subj || !user) return;

    cmsStore.createLearningDocument({
      tenantId,
      documentType: formType,
      title: formTitle,
      subjectId: subj.id,
      subjectName: subj.name,
      gradeLevel: formGrade,
      authorId: user.id,
      authorName: user.name,
      curriculumCode: 'MERDEKA',
      summary: formSummary,
      content: JSON.stringify({
        alokasiWaktu: formAlokasi,
        langkahPembelajaran: formLangkah.split('\n'),
      }),
    }, user);

    refreshData();
    setShowCreateModal(false);
  };

  const handleSubmit = (id: string) => {
    if (confirm('Ajukan dokumen pembelajaran ini untuk supervisi dan persetujuan Kepala Sekolah?')) {
      cmsStore.submitLearningDocument(id, user);
      refreshData();
    }
  };

  const handleApprove = (doc: LearningDocument) => {
    if (!user) return;
    cmsStore.approveLearningDocument(doc.id, user);
    refreshData();
    setShowReviewModal(false);
  };

  const handleRequestRevision = (doc: LearningDocument) => {
    if (!user || !revisionNotes.trim()) return;
    cmsStore.requestRevisionLearningDocument(doc.id, user, revisionNotes);
    refreshData();
    setShowReviewModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus dokumen pembelajaran ini?')) {
      cmsStore.deleteLearningDocument(id, user);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-blue-600" />
            Dokumen Pembelajaran (Modul Ajar, RPP, RPS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Penyusunan modul ajar Kurikulum Merdeka, silabus, dan verifikasi supervisi pimpinan.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Susun Dokumen Baru
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul modul ajar, mata pelajaran, atau penyusun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">Semua Jenis Dokumen</option>
            <option value="MODUL_AJAR">Modul Ajar</option>
            <option value="RPP">RPP</option>
            <option value="SILABUS">Silabus</option>
            <option value="RPS">RPS Kampus</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="APPROVED">Disetujui (Approved)</option>
            <option value="SUBMITTED">Diajukan (Submitted)</option>
            <option value="REVISION">Perlu Revisi</option>
            <option value="DRAFT">Draf (Draft)</option>
          </select>
        </div>
      </div>

      {/* Grid Dokumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => {
          let statusBadge = (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              DRAF
            </span>
          );
          if (doc.status === 'APPROVED') {
            statusBadge = (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> Disetujui
              </span>
            );
          } else if (doc.status === 'SUBMITTED') {
            statusBadge = (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3" /> Menunggu Supervisi
              </span>
            );
          } else if (doc.status === 'REVISION') {
            statusBadge = (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                <AlertCircle className="w-3 h-3" /> Perlu Revisi
              </span>
            );
          }

          return (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {doc.documentType.replace('_', ' ')}
                  </span>
                  {statusBadge}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs text-blue-700 font-semibold mt-1">
                  {doc.subjectName} • {doc.gradeLevel}
                </p>

                {doc.summary && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>
                )}

                {doc.revisionNotes && (
                  <div className="mt-3 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-[11px] flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Catatan Revisi: {doc.revisionNotes}</span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                  <span>Penyusun: <strong className="text-slate-700">{doc.authorName}</strong></span>
                  <span>Versi {doc.version}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {doc.status === 'DRAFT' || doc.status === 'REVISION' ? (
                  <button
                    onClick={() => handleSubmit(doc.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Ajukan Supervisi
                  </button>
                ) : null}

                {isSupervisor && doc.status === 'SUBMITTED' && (
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setRevisionNotes('');
                      setShowReviewModal(true);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Supervisi & Verifikasi
                  </button>
                )}

                {doc.status === 'APPROVED' && (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Diverifikasi oleh {doc.reviewedByName}
                  </span>
                )}

                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => handleDelete(doc.id)}
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

      {/* Modal Tambah Dokumen */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Susun Dokumen Pembelajaran Baru</h3>
            <form onSubmit={handleSaveDoc} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jenis Dokumen</label>
                  <select
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="MODUL_AJAR">Modul Ajar Kurikulum Merdeka</option>
                    <option value="RPP">RPP (Rencana Pelaksanaan Pembelajaran)</option>
                    <option value="SILABUS">Silabus Pembelajaran</option>
                    <option value="RPS">Rencana Pembelajaran Semester (RPS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tingkat Kelas / Fase</label>
                  <input
                    type="text"
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    placeholder="X (Fase E) / XI"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Judul Dokumen / Topik Materi</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Modul Ajar Matematika: Sistem Persamaan Linear Tiga Variabel"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Mata Pelajaran</label>
                  <select
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
                  <label className="block text-xs font-bold text-slate-700 uppercase">Alokasi Waktu</label>
                  <input
                    type="text"
                    value={formAlokasi}
                    onChange={(e) => setFormAlokasi(e.target.value)}
                    placeholder="4 x 45 Menit (2 Pertemuan)"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Ringkasan / Sinopsis Modul</label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Gambaran umum materi pembelajaran kontekstual..."
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Langkah-Langkah Pembelajaran & Asesmen
                </label>
                <textarea
                  rows={4}
                  value={formLangkah}
                  onChange={(e) => setFormLangkah(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Simpan Draf Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Supervisi & Verifikasi (Kepala Sekolah / Supervisor) */}
      {showReviewModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Supervisi Dokumen Pembelajaran
            </h3>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedDoc.title}</p>
              <p className="text-slate-600">
                Penyusun: <strong>{selectedDoc.authorName}</strong> • {selectedDoc.subjectName}
              </p>
              {selectedDoc.summary && <p className="text-slate-500 italic mt-1">{selectedDoc.summary}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Catatan Evaluasi / Koreksi (Opsional jika disetujui)
              </label>
              <textarea
                rows={3}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Tuliskan catatan perbaikan jika dokumen memerlukan revisi sebelum disetujui..."
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleRequestRevision(selectedDoc)}
                disabled={!revisionNotes.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 transition"
              >
                Minta Revisi
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedDoc)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                >
                  Setujui & Verifikasi Resmi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
