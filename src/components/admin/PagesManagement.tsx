import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  Save,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { Page, ActiveNav } from '../../types';
import { slugify, formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface PagesManagementProps {
  pages: Page[];
  onNavigate: (nav: ActiveNav) => void;
}

export const PagesManagement: React.FC<PagesManagementProps> = ({
  pages,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Form Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    metaTitle: '',
    metaDescription: '',
  });

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  const canCreate = hasPermission(user, 'pages.create');
  const canEdit = hasPermission(user, 'pages.update');
  const canDelete = hasPermission(user, 'pages.delete');

  const filteredPages = pages.filter(
    (pg) =>
      pg.title.toLowerCase().includes(search.toLowerCase()) ||
      pg.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'PUBLISHED',
      metaTitle: '',
      metaDescription: '',
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt,
      content: page.content,
      status: page.status === 'TRASHED' ? 'DRAFT' : page.status,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
    });
    setFormModalOpen(true);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingPage) {
      cmsStore.updatePage(
        editingPage.id,
        {
          ...formData,
          slug: formData.slug.trim() ? slugify(formData.slug) : slugify(formData.title),
        },
        user
      );
    } else {
      cmsStore.createPage(
        {
          ...formData,
          slug: formData.slug.trim() ? slugify(formData.slug) : slugify(formData.title),
        },
        user
      );
    }

    setFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (pageToDelete) {
      cmsStore.deletePage(pageToDelete.id, user);
      setDeleteModalOpen(false);
      setPageToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Manajemen Halaman Statis CMS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola konten halaman permanen institusi seperti Profil, Visi Misi, Sejarah, dan Fasilitas.
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" onClick={handleOpenCreate} className="gap-2 shrink-0 font-bold">
            <Plus className="w-4 h-4" />
            <span>Buat Halaman Baru</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul halaman atau tautan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPages.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Tidak ada halaman yang ditemukan"
                description="Mulai buat halaman profil institusi pertama."
                actionLabel={canCreate ? 'Buat Halaman Baru' : undefined}
                onAction={handleOpenCreate}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Judul Halaman</th>
                    <th className="py-3 px-4">Tautan Slug</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Terakhir Diperbarui</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPages.map((page) => (
                    <tr
                      key={page.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{page.title}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{page.excerpt}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        /{page.slug}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={page.status === 'PUBLISHED' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {page.status === 'PUBLISHED' ? 'Tayang' : 'Draf'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(page.updatedAt || page.createdAt, 'short')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(page)}
                              title="Edit Halaman"
                              className="w-8 h-8 text-blue-600"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPageToDelete(page);
                                setDeleteModalOpen(true);
                              }}
                              title="Hapus Halaman"
                              className="w-8 h-8 text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Form Tambah / Edit Halaman */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingPage ? 'Edit Halaman Statis' : 'Buat Halaman Statis Baru'}
        maxWidth="xl"
      >
        <form onSubmit={handleSavePage} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              Judul Halaman <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="cth: Visi Misi dan Tujuan Sekolah"
              value={formData.title}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  title: val,
                  slug: editingPage ? formData.slug : slugify(val),
                  metaTitle: editingPage ? formData.metaTitle : val,
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Slug URL
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                className="w-full font-mono px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="PUBLISHED">Tayang (Published)</option>
                <option value="DRAFT">Draf</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Ringkasan Halaman
            </label>
            <textarea
              rows={2}
              placeholder="Ringkasan isi halaman..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Konten Lengkap
            </label>
            <textarea
              rows={8}
              required
              placeholder="Tuliskan isi halaman..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full font-mono px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setFormModalOpen(false)}>
              Batalkan
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Halaman
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus Halaman"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus halaman "<strong>{pageToDelete?.title}</strong>"?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
