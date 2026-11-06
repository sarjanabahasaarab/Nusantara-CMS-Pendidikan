import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Folder,
  CornerDownRight,
  AlertTriangle,
  Search,
  CheckCircle,
} from 'lucide-react';
import { Category, ActiveNav } from '../../types';
import { slugify } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface CategoryManagementProps {
  categories: Category[];
  onNavigate: (nav: ActiveNav) => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Form Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugAuto, setSlugAuto] = useState(true);
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const canManage = hasPermission(user, 'categories.manage');

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setSlugAuto(true);
    setParentId('');
    setDescription('');
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugAuto(false);
    setParentId(cat.parentId || '');
    setDescription(cat.description || '');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (slugAuto) {
      setSlug(slugify(val));
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Nama kategori wajib diisi.');
      return;
    }

    try {
      if (editingCategory) {
        // Cek siklus jika memilih parent
        if (parentId && !cmsStore.validateNoParentCycle(editingCategory.id, parentId)) {
          setErrorMessage('Siklus terdeteksi: Tidak dapat memilih kategori turunan sebagai induk.');
          return;
        }

        cmsStore.updateCategory(
          editingCategory.id,
          {
            name: name.trim(),
            slug: slug.trim() || slugify(name),
            parentId: parentId || null,
            description: description.trim() || undefined,
          },
          user
        );
      } else {
        cmsStore.createCategory(
          {
            name: name.trim(),
            slug: slug.trim() || slugify(name),
            parentId: parentId || null,
            description: description.trim() || undefined,
          },
          user
        );
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan kategori');
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      cmsStore.deleteCategory(categoryToDelete.id, user);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Build tree list for visualization
  const rootCategories = categories.filter((c) => !c.parentId);
  const getSubcategories = (parentCatId: string) =>
    categories.filter((c) => c.parentId === parentCatId);

  // Filtered view by search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-blue-600" />
            <span>Kategori Berjenjang (Hierarchical Taxonomy)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola taksonomi konten bertingkat untuk jenjang pendidikan (SD, SMP, SMA, SMK, PT) dan warta sekolah.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="gap-2 shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
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
              placeholder="Cari kategori atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical Tree Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Nama Kategori & Struktur Pohon</th>
                <th className="p-3">Slug URL</th>
                <th className="p-3">Deskripsi</th>
                <th className="p-3">Jumlah Konten</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <EmptyState
                      title="Tidak ada kategori ditemukan"
                      description="Tambahkan kategori baru untuk mengelompokkan materi atau berita."
                    />
                  </td>
                </tr>
              ) : search.trim() ? (
                // Flat view when searching
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Folder className="w-4 h-4 text-blue-600" />
                      <span>{cat.name}</span>
                      {cat.parentName && (
                        <span className="text-[10px] text-slate-400">
                          (Induk: {cat.parentName})
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">/{cat.slug}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="p-3">
                      <Badge variant="blue">{cat.postCount || 0} konten</Badge>
                    </td>
                    <td className="p-3 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setCategoryToDelete(cat);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                // Tree view when not searching
                rootCategories.map((root) => {
                  const children = getSubcategories(root.id);
                  return (
                    <React.Fragment key={root.id}>
                      {/* Root Category Row */}
                      <tr className="bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-semibold">
                        <td className="p-3 text-slate-900 dark:text-white flex items-center gap-2 font-bold">
                          <Folder className="w-4 h-4 text-blue-600" />
                          <span>{root.name}</span>
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            Utama
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">/{root.slug}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{root.description || '—'}</td>
                        <td className="p-3">
                          <Badge variant="blue">{root.postCount || 0} konten</Badge>
                        </td>
                        <td className="p-3 text-right">
                          {canManage && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(root)}
                                title="Edit Kategori"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setCategoryToDelete(root);
                                  setDeleteModalOpen(true);
                                }}
                                title="Hapus Kategori"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Subcategories (Indented) */}
                      {children.map((sub) => (
                        <tr
                          key={sub.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-3 pl-8 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">{sub.name}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">/{sub.slug}</td>
                          <td className="p-3 text-slate-500 max-w-xs truncate">{sub.description || '—'}</td>
                          <td className="p-3">
                            <Badge variant="gray">{sub.postCount || 0} konten</Badge>
                          </td>
                          <td className="p-3 text-right">
                            {canManage && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                onClick={() => openEditModal(sub)}
                                title="Edit Sub-kategori"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setCategoryToDelete(sub);
                                  setDeleteModalOpen(true);
                                }}
                                title="Hapus Sub-kategori"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>

    {/* Form Add / Edit Modal */}
    {modalOpen && (
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
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
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Kurikulum Merdeka, Prestasi, dsb."
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
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugAuto(false);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategori Induk (Parent Category)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="">— Tidak Ada (Jadikan Kategori Utama) —</option>
              {categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parentName ? `— ${cat.name}` : cat.name}
                  </option>
                ))}
            </select>
            <span className="text-[10px] text-slate-400 block">
              Dukungan struktur bertingkat (misal: Pendidikan → SMA atau Berita → Akademik).
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Deskripsi Singkat
            </label>
            <textarea
              rows={3}
              placeholder="Deskripsi penjelasan kategori..."
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
              Simpan Kategori
            </Button>
          </div>
        </div>
      </Modal>
    )}

    {/* Delete Confirmation Modal */}
    {deleteModalOpen && categoryToDelete && (
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Kategori"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus kategori{' '}
            <strong className="text-slate-900 dark:text-white">
              "{categoryToDelete.name}"
            </strong>
            ? Konten yang tergabung dalam kategori ini tidak akan terhapus, melainkan disetel menjadi tanpa kategori.
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
              Hapus Kategori
            </Button>
          </div>
        </div>
      </Modal>
    )}
  </div>
  );
};
