import React, { useState } from 'react';
import {
  Tag as TagIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Hash,
  AlertTriangle,
} from 'lucide-react';
import { Tag, ActiveNav } from '../../types';
import { slugify } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface TagManagementProps {
  tags: Tag[];
  onNavigate: (nav: ActiveNav) => void;
}

export const TagManagement: React.FC<TagManagementProps> = ({
  tags,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const canManage = hasPermission(user, 'tags.manage');

  const openCreateModal = () => {
    setEditingTag(null);
    setName('');
    setSlug('');
    setDescription('');
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (t: Tag) => {
    setEditingTag(t);
    setName(t.name);
    setSlug(t.slug);
    setDescription(t.description || '');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingTag) {
      setSlug(slugify(val));
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Nama tag wajib diisi.');
      return;
    }

    try {
      if (editingTag) {
        cmsStore.updateTag(
          editingTag.id,
          {
            name: name.trim(),
            slug: slug.trim() || slugify(name),
            description: description.trim() || undefined,
          },
          user
        );
      } else {
        cmsStore.createTag(
          {
            name: name.trim(),
            slug: slug.trim() || slugify(name),
            description: description.trim() || undefined,
          },
          user
        );
      }
      setModalOpen(false);
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal menyimpan tag');
    }
  };

  const handleConfirmDelete = () => {
    if (tagToDelete) {
      cmsStore.deleteTag(tagToDelete.id, user);
      setDeleteModalOpen(false);
      setTagToDelete(null);
    }
  };

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-blue-600" />
            <span>Manajemen Tag Konten</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola label topik artikel dan warta berita untuk mempermudah pencarian dan pengelompokan silang.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="gap-2 shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tag Baru</span>
          </Button>
        )}
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari label tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags Grid / Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTags.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <Card>
              <CardContent className="p-8 text-center">
                <EmptyState
                  title="Tidak ada tag ditemukan"
                  description="Tambahkan tag untuk menghubungkan artikel dengan topik yang relevan."
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-blue-600" />
                      {tag.name}
                    </span>
                    <Badge variant="blue" className="text-[10px]">
                      {tag.postCount || 0} konten
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">/{tag.slug}</p>
                  {tag.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2">
                      {tag.description}
                    </p>
                  )}
                </div>

                {canManage && (
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => openEditModal(tag)}
                      title="Edit Tag"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setTagToDelete(tag);
                        setDeleteModalOpen(true);
                      }}
                      title="Hapus Tag"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
          title={editingTag ? 'Edit Tag' : 'Tambah Tag Baru'}
        >
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Tag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Robotika, PPDB 2026, Beasiswa"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Slug URL
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Deskripsi Singkat
              </label>
              <textarea
                rows={2}
                placeholder="Deskripsi penjelasan tag..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Simpan Tag
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && tagToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Hapus Tag"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus tag{' '}
              <strong className="text-slate-900 dark:text-white">
                "#{tagToDelete.name}"
              </strong>
              ? Tag ini akan dilepas dari semua artikel terkait.
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
                Hapus Tag
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
