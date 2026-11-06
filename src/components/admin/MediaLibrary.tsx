import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  Copy,
  Check,
  Grid,
  List as ListIcon,
  Search,
  Filter,
  HardDrive,
  Info,
} from 'lucide-react';
import { Media } from '../../types';
import { formatBytes, formatDate } from '../../lib/utils';
import { getStorageProvider } from '../../lib/storage';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface MediaLibraryProps {
  media: Media[];
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ media }) => {
  const { user } = useAuth();
  const storageProvider = getStorageProvider();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'DOC'>('ALL');

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Detail preview modal
  const [detailMedia, setDetailMedia] = useState<Media | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const canUpload = hasPermission(user, 'media.upload');
  const canDelete = hasPermission(user, 'media.delete');

  const filteredMedia = media.filter((m) => {
    const matchesSearch =
      m.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()));

    if (filterType === 'IMAGE') return matchesSearch && m.mimeType.startsWith('image/');
    if (filterType === 'DOC') return matchesSearch && !m.mimeType.startsWith('image/');
    return matchesSearch;
  });

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const uploadResult = await storageProvider.upload(selectedFile);
      cmsStore.addMedia(
        {
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          mimeType: uploadResult.mimeType,
          fileSize: uploadResult.fileSize,
          altText: altText || selectedFile.name,
          uploadedBy: user?.id || 'admin',
        },
        user
      );

      setIsUploading(false);
      setUploadModalOpen(false);
      setSelectedFile(null);
      setAltText('');
    } catch (err) {
      alert('Gagal mengunggah berkas.');
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus berkas media ini?')) {
      cmsStore.deleteMedia(id, user);
      if (detailMedia?.id === id) {
        setDetailMedia(null);
      }
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pustaka Media & Penyimpanan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>Storage Provider Aktif:</span>
            <Badge variant="purple" size="sm" className="font-mono text-[10px]">
              {storageProvider.name.toUpperCase()}
            </Badge>
          </p>
        </div>

        {canUpload && (
          <Button
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            className="gap-2 shrink-0 font-bold"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Berkas Baru</span>
          </Button>
        )}
      </div>

      {/* Control bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama berkas atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1">
              <Button
                variant={filterType === 'ALL' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType('ALL')}
                className="text-xs h-8"
              >
                Semua
              </Button>
              <Button
                variant={filterType === 'IMAGE' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType('IMAGE')}
                className="text-xs h-8"
              >
                Foto
              </Button>
              <Button
                variant={filterType === 'DOC' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType('DOC')}
                className="text-xs h-8"
              >
                Dokumen
              </Button>
            </div>

            {/* View Mode Grid/List */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Grid"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Daftar"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid or List */}
      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="Pustaka media masih kosong"
              description="Unggah foto kegiatan, gedung sekolah, logo, atau dokumen surat edaran ke pustaka."
              actionLabel={canUpload ? 'Unggah Berkas Sekarang' : undefined}
              onAction={() => setUploadModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              hoverEffect
              className="cursor-pointer group flex flex-col justify-between overflow-hidden"
              onClick={() => setDetailMedia(item)}
            >
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                {item.mimeType.startsWith('image/') ? (
                  <img
                    src={item.fileUrl}
                    alt={item.altText || item.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-slate-400" />
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="purple" size="sm" className="text-[10px]">
                    {formatBytes(item.fileSize)}
                  </Badge>
                </div>
              </div>
              <div className="p-2.5 space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.fileName}
                </p>
                <p className="text-[10px] text-slate-400">
                  {formatDate(item.createdAt, 'short')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nama Berkas</th>
                    <th className="py-3 px-4">Tipe MIME</th>
                    <th className="py-3 px-4">Ukuran</th>
                    <th className="py-3 px-4">Pengunggah</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMedia.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer"
                      onClick={() => setDetailMedia(item)}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {item.mimeType.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-indigo-500" />
                        )}
                        <span className="truncate max-w-xs">{item.fileName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {item.mimeType}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatBytes(item.fileSize)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {item.uploaderName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(item.createdAt, 'short')}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyLink(item.fileUrl)}
                            title="Salin Tautan URL"
                            className="w-7 h-7 text-slate-500"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMedia(item.id)}
                              title="Hapus Berkas"
                              className="w-7 h-7 text-rose-600"
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
          </CardContent>
        </Card>
      )}

      {/* Modal Upload Berkas */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Unggah Berkas ke Pustaka Media"
        maxWidth="md"
      >
        <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Pilih Berkas dari Komputer <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              required
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                  if (!altText) setAltText(e.target.files[0].name);
                }
              }}
              className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Teks Alternatif (Alt Text Aksesibilitas & SEO)
            </label>
            <input
              type="text"
              placeholder="Deskripsi singkat foto untuk pembaca layar..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setUploadModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isUploading}>
              Unggah Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Berkas Media */}
      {detailMedia && (
        <Modal
          isOpen={!!detailMedia}
          onClose={() => setDetailMedia(null)}
          title="Detail Berkas Media"
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            {detailMedia.mimeType.startsWith('image/') ? (
              <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img
                  src={detailMedia.fileUrl}
                  alt={detailMedia.altText || ''}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 dark:text-slate-200">{detailMedia.fileName}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-slate-400 text-[11px]">Nama Berkas:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {detailMedia.fileName}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Ukuran:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatBytes(detailMedia.fileSize)}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Tipe Berkas:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {detailMedia.mimeType}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Pengunggah:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailMedia.uploaderName}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 text-[11px]">Tautan Langsung (Direct URL):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={detailMedia.fileUrl}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(detailMedia.fileUrl)}
                  className="gap-1 shrink-0 text-xs"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Disalin' : 'Salin'}</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMedia(detailMedia.id)}
                  className="gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Berkas</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setDetailMedia(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
