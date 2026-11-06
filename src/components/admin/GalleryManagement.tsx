import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Camera,
  Layers,
  Upload,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { GalleryAlbum, GalleryPhoto, ActiveNav } from '../../types';
import { slugify, formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface GalleryManagementProps {
  albums: GalleryAlbum[];
  onNavigate: (nav: ActiveNav, slug?: string) => void;
}

export const GalleryManagement: React.FC<GalleryManagementProps> = ({
  albums,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Album Modal states
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [errorMessage, setErrorMessage] = useState('');

  // Manage Photos inside Album modal
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<GalleryAlbum | null>(null);

  const canManage = hasPermission(user, 'gallery.manage');

  const openCreateAlbumModal = () => {
    setEditingAlbum(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setCoverImage('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800');
    setStatus('PUBLISHED');
    setErrorMessage('');
    setAlbumModalOpen(true);
  };

  const openEditAlbumModal = (a: GalleryAlbum) => {
    setEditingAlbum(a);
    setTitle(a.title);
    setSlug(a.slug);
    setDescription(a.description || '');
    setCoverImage(a.coverImage);
    setStatus(a.status);
    setErrorMessage('');
    setAlbumModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingAlbum) {
      setSlug(slugify(val));
    }
  };

  const handleSaveAlbum = () => {
    if (!title.trim() || !coverImage.trim()) {
      setErrorMessage('Judul album dan tautan sampul foto wajib diisi.');
      return;
    }

    try {
      if (editingAlbum) {
        cmsStore.updateAlbum(
          editingAlbum.id,
          {
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            description: description.trim() || undefined,
            coverImage: coverImage.trim(),
            status,
          },
          user
        );
      } else {
        cmsStore.createAlbum(
          {
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            description: description.trim() || undefined,
            coverImage: coverImage.trim(),
            status,
          },
          user
        );
      }
      setAlbumModalOpen(false);
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal menyimpan album');
    }
  };

  const handleConfirmDeleteAlbum = () => {
    if (albumToDelete) {
      cmsStore.deleteAlbum(albumToDelete.id, user);
      setDeleteModalOpen(false);
      setAlbumToDelete(null);
    }
  };

  const openPhotosManager = (album: GalleryAlbum) => {
    setSelectedAlbum(album);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setPhotoModalOpen(true);
  };

  const handleAddPhoto = () => {
    if (!selectedAlbum || !newPhotoUrl.trim()) return;

    cmsStore.addPhotoToAlbum(
      {
        albumId: selectedAlbum.id,
        imageUrl: newPhotoUrl.trim(),
        caption: newPhotoCaption.trim() || undefined,
      },
      user
    );

    // Refresh selected album state
    const refreshed = cmsStore.getAlbumBySlug(selectedAlbum.slug);
    if (refreshed) {
      setSelectedAlbum(refreshed);
    }
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!selectedAlbum) return;
    cmsStore.deletePhoto(photoId, user);
    const refreshed = cmsStore.getAlbumBySlug(selectedAlbum.slug);
    if (refreshed) {
      setSelectedAlbum(refreshed);
    }
  };

  const filteredAlbums = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            <span>Manajemen Galeri & Album Dokumentasi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola album foto kegiatan kampus, karnaval budaya, juara kompetisi, dan praktikum laboratorium.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={openCreateAlbumModal}
            className="gap-2 shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Album Baru</span>
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
              placeholder="Cari album foto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlbums.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="p-8 text-center">
                <EmptyState
                  title="Tidak ada album galeri"
                  description="Buat album baru untuk mengunggah momen dokumentasi foto sekolah."
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredAlbums.map((album) => (
            <Card key={album.id} className="overflow-hidden group hover:shadow-lg transition-all">
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <Badge variant={album.status === 'PUBLISHED' ? 'green' : 'gray'}>
                    {album.status === 'PUBLISHED' ? 'Tayang' : 'Draf'}
                  </Badge>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {album.photosCount || 0} foto
                  </span>
                </div>
              </div>

              {/* Album Details */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {album.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {album.description || 'Tidak ada deskripsi album.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">
                    {formatDate(album.createdAt)}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* View Photos Manager */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPhotosManager(album)}
                      className="text-xs gap-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Kelola Foto</span>
                    </Button>

                    {canManage && (
                      <>
                        <button
                          onClick={() => openEditAlbumModal(album)}
                          title="Edit Info Album"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAlbumToDelete(album);
                            setDeleteModalOpen(true);
                          }}
                          title="Hapus Album"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Album Form Add/Edit Modal */}
      {albumModalOpen && (
        <Modal
          isOpen={albumModalOpen}
          onClose={() => setAlbumModalOpen(false)}
          title={editingAlbum ? 'Edit Album Galeri' : 'Buat Album Galeri Baru'}
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
                Judul Album Foto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Kemeriahan Festival Seni Budaya 2026..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                URL Sampul (Cover Image) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Status Publikasi
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Deskripsi Album
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan momen yang diabadikan dalam album ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setAlbumModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAlbum}>
                Simpan Album
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Photos Manager Modal for an Album */}
      {photoModalOpen && selectedAlbum && (
        <Modal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          title={`Kelola Foto — ${selectedAlbum.title}`}
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Add photo bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Tambah Foto ke Album Ini:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="URL Foto (https://...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="bg-white dark:bg-slate-950 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-800"
                />
                <input
                  type="text"
                  placeholder="Keterangan / Kepsyen foto..."
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="bg-white dark:bg-slate-950 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!newPhotoUrl.trim()}
                  onClick={handleAddPhoto}
                  className="text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan Foto</span>
                </Button>
              </div>
            </div>

            {/* Photos List Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daftar Foto dalam Album ({selectedAlbum.photos?.length || 0})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedAlbum.photos && selectedAlbum.photos.length > 0 ? (
                  selectedAlbum.photos.map((p) => (
                    <div
                      key={p.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group relative bg-white dark:bg-slate-900"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.caption || ''}
                        className="w-full h-28 object-cover"
                      />
                      <div className="p-2 text-[10px] text-slate-600 dark:text-slate-400 truncate">
                        {p.caption || 'Tanpa kepsyen'}
                      </div>
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeletePhoto(p.id)}
                          className="p-1 rounded-md bg-red-600 text-white shadow-xs hover:bg-red-700"
                          title="Hapus foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-6 text-xs text-slate-400">
                    Belum ada foto dalam album ini. Masukkan URL foto di atas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && albumToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Hapus Album Galeri"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus album{' '}
              <strong className="text-slate-900 dark:text-white">
                "{albumToDelete.title}"
              </strong>
              ? Seluruh foto di dalam album ini juga akan dihapus.
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
                onClick={handleConfirmDeleteAlbum}
              >
                Hapus Album
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
