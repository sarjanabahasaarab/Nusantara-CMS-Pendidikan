import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  Calendar,
  AlertTriangle,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Announcement, ActiveNav, AnnouncementPriority } from '../../types';
import { slugify, formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface AnnouncementManagementProps {
  announcements: Announcement[];
  onNavigate: (nav: ActiveNav) => void;
}

export const AnnouncementManagement: React.FC<AnnouncementManagementProps> = ({
  announcements,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('NORMAL');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attachment, setAttachment] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [annToDelete, setAnnToDelete] = useState<Announcement | null>(null);

  const canManage = hasPermission(user, 'announcements.manage');

  const openCreateModal = () => {
    setEditingAnn(null);
    setTitle('');
    setSlug('');
    setContent('');
    setPriority('NORMAL');
    setStatus('PUBLISHED');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setAttachment('');
    setAttachmentName('');
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingAnn(a);
    setTitle(a.title);
    setSlug(a.slug);
    setContent(a.content);
    setPriority(a.priority);
    setStatus(a.status);
    setStartDate(a.startDate ? a.startDate.slice(0, 10) : '');
    setEndDate(a.endDate ? a.endDate.slice(0, 10) : '');
    setAttachment(a.attachment || '');
    setAttachmentName(a.attachmentName || '');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingAnn) {
      setSlug(slugify(val));
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    try {
      if (editingAnn) {
        cmsStore.updateAnnouncement(
          editingAnn.id,
          {
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            content: content.trim(),
            priority,
            status,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            attachment: attachment.trim() || undefined,
            attachmentName: attachmentName.trim() || undefined,
          },
          user
        );
      } else {
        cmsStore.createAnnouncement(
          {
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            content: content.trim(),
            priority,
            status,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            attachment: attachment.trim() || undefined,
            attachmentName: attachmentName.trim() || undefined,
            authorId: user?.id,
            authorName: user?.name,
          },
          user
        );
      }
      setModalOpen(false);
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal menyimpan pengumuman');
    }
  };

  const handleConfirmDelete = () => {
    if (annToDelete) {
      cmsStore.deleteAnnouncement(annToDelete.id, user);
      setDeleteModalOpen(false);
      setAnnToDelete(null);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchesPriority =
      priorityFilter === 'ALL' || a.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (p: AnnouncementPriority) => {
    switch (p) {
      case 'URGENT':
        return <Badge variant="red" className="text-[10px]">Mendesak (Urgent)</Badge>;
      case 'IMPORTANT':
        return <Badge variant="amber" className="text-[10px]">Penting</Badge>;
      case 'NORMAL':
        return <Badge variant="blue" className="text-[10px]">Biasa</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <span>Manajemen Pengumuman Resmi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasikan surat edaran, regulasi akademik, pembaharuan PPDB, dan pemberitahuan penting pimpinan institusi.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="gap-2 shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman Baru</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul atau isi pengumuman..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                aria-label="Filter prioritas pengumuman"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Tingkat Prioritas</option>
                <option value="URGENT">Mendesak (Urgent)</option>
                <option value="IMPORTANT">Penting</option>
                <option value="NORMAL">Biasa</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <EmptyState
                title="Tidak ada pengumuman ditemukan"
                description="Buat pengumuman baru untuk menyampaikan informasi resmi ke siswa, guru, dan orang tua."
              />
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((ann) => (
            <Card key={ann.id} className="hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(ann.priority)}
                    <Badge variant={ann.status === 'PUBLISHED' ? 'green' : 'gray'}>
                      {ann.status === 'PUBLISHED' ? 'Tayang' : 'Draf'}
                    </Badge>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>

                  {ann.attachment && (
                    <div className="pt-2">
                      <a
                        href={ann.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{ann.attachmentName || 'Lampiran Dokumen PDF Resmi'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => openEditModal(ann)}
                      title="Edit Pengumuman"
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setAnnToDelete(ann);
                        setDeleteModalOpen(true);
                      }}
                      title="Hapus Pengumuman"
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Add / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingAnn ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Judul Pengumuman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Jadwal Verifikasi PPDB Afirmasi..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                >
                  <option value="NORMAL">Biasa (Normal)</option>
                  <option value="IMPORTANT">Penting (Important)</option>
                  <option value="URGENT">Mendesak (Urgent)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                >
                  <option value="PUBLISHED">Tayang (Published)</option>
                  <option value="DRAFT">Draf (Draft)</option>
                  <option value="ARCHIVED">Arsip (Archived)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Isi Pengumuman Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Tuliskan isi pengumuman dan rincian instruksi bagi pembaca..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tanggal Berlaku Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tautan Lampiran Berkas PDF (Opsional)
              </label>
              <input
                type="text"
                placeholder="https://.../surat-edaran.pdf"
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Tampilan Lampiran
              </label>
              <input
                type="text"
                placeholder="Contoh: Formulir_Pendaftaran_PPDB_2026.pdf"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Simpan Pengumuman
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && annToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Hapus Pengumuman"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus pengumuman{' '}
              <strong className="text-slate-900 dark:text-white">
                "{annToDelete.title}"
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Hapus Pengumuman
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
