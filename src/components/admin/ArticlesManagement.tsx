import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ArrowUpDown,
} from 'lucide-react';
import { Post, Category, ActiveNav, PostStatus } from '../../types';
import { formatDate } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface ArticlesManagementProps {
  posts: Post[];
  categories: Category[];
  onNavigate: (nav: ActiveNav, postIdOrSlug?: string) => void;
  postTypeFilter?: 'ARTICLE' | 'NEWS';
}

export const ArticlesManagement: React.FC<ArticlesManagementProps> = ({
  posts,
  categories,
  onNavigate,
  postTypeFilter = 'ARTICLE',
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | PostStatus>('ALL');
  const [selectedAuthor, setSelectedAuthor] = useState('ALL');

  // Multi-select & Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  const canCreate = hasPermission(user, 'posts.create');
  const canEdit = hasPermission(user, 'posts.update');
  const canDelete = hasPermission(user, 'posts.delete');
  const canPublish = hasPermission(user, 'posts.publish');

  // Filter posts by type (ARTICLE)
  const scopedPosts = posts.filter((p) => p.type === postTypeFilter);

  // Tab counts
  const countAll = scopedPosts.filter((p) => p.status !== 'TRASHED').length;
  const countPublished = scopedPosts.filter((p) => p.status === 'PUBLISHED').length;
  const countScheduled = scopedPosts.filter((p) => p.status === 'SCHEDULED').length;
  const countDraft = scopedPosts.filter((p) => p.status === 'DRAFT').length;
  const countTrashed = scopedPosts.filter((p) => p.status === 'TRASHED').length;

  // Filtered list
  const filteredPosts = scopedPosts.filter((post) => {
    // Tab filter
    if (activeTab === 'ALL') {
      if (post.status === 'TRASHED') return false; // Jangan tampilkan sampah di tab Semua
    } else {
      if (post.status !== activeTab) return false;
    }

    // Search filter
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    // Category filter
    const matchesCategory =
      selectedCategory === 'ALL' || post.categoryId === selectedCategory;

    // Author filter
    const matchesAuthor =
      selectedAuthor === 'ALL' || post.authorId === selectedAuthor;

    return matchesSearch && matchesCategory && matchesAuthor;
  });

  // Authors unique list
  const authors = Array.from(
    new Set(
      scopedPosts
        .filter((p) => p.authorName && p.authorId)
        .map((p) => JSON.stringify({ id: p.authorId, name: p.authorName }))
    )
  ).map((str) => JSON.parse(str));

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Checkbox select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(displayedPosts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk handlers
  const handleBulkStatusChange = (status: PostStatus) => {
    if (!canPublish && status === 'PUBLISHED') return;
    cmsStore.bulkUpdateStatus(selectedIds, status, user);
    setSelectedIds([]);
  };

  const handleBulkCategoryChange = (catId: string) => {
    if (!catId) return;
    cmsStore.bulkUpdateCategory(selectedIds, catId, user);
    setSelectedIds([]);
    setBulkCategoryTarget('');
  };

  const handleBulkTrash = () => {
    if (!canDelete) return;
    cmsStore.bulkTrashPosts(selectedIds, user);
    setSelectedIds([]);
  };

  const handleBulkRestore = () => {
    cmsStore.bulkUpdateStatus(selectedIds, 'DRAFT', user);
    setSelectedIds([]);
  };

  const handleBulkPermanentDelete = () => {
    if (!canDelete) return;
    cmsStore.bulkDeletePosts(selectedIds, user);
    setSelectedIds([]);
  };

  // Single post handlers
  const handleTrashSingle = (post: Post) => {
    cmsStore.trashPost(post.id, user);
  };

  const handleRestoreSingle = (post: Post) => {
    cmsStore.restorePost(post.id, user);
  };

  const handlePermanentDeleteSingle = (post: Post) => {
    setPostToDelete(post);
    setIsPermanentDelete(true);
    setDeleteModalOpen(true);
  };

  const handleConfirmPermanentDelete = () => {
    if (postToDelete) {
      cmsStore.permanentDeletePost(postToDelete.id, user);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleToggleFeatured = (post: Post) => {
    if (!canEdit) return;
    cmsStore.updatePost(post.id, { isFeatured: !post.isFeatured }, user);
  };

  const getStatusBadge = (post: Post) => {
    switch (post.status) {
      case 'PUBLISHED':
        return <Badge variant="green" className="text-[10px]">Tayang</Badge>;
      case 'SCHEDULED':
        return (
          <Badge variant="blue" className="text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Terjadwal</span>
          </Badge>
        );
      case 'DRAFT':
        return <Badge variant="gray" className="text-[10px]">Draf</Badge>;
      case 'TRASHED':
        return <Badge variant="red" className="text-[10px]">Sampah</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {postTypeFilter === 'NEWS' ? 'Manajemen Warta Berita' : 'Manajemen Artikel Edukasi'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {postTypeFilter === 'NEWS'
              ? 'Kelola warta, liputan acara, pengumuman pers, dan pencapaian kejuaraan sekolah.'
              : 'Kelola artikel ilmiah, opini guru, pedoman ajar, dan esai kependidikan.'}
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={() => onNavigate(postTypeFilter === 'NEWS' ? 'admin-news-create' : 'admin-post-create')}
            className="gap-2 shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{postTypeFilter === 'NEWS' ? 'Tulis Berita Baru' : 'Tulis Artikel Baru'}</span>
          </Button>
        )}
      </div>

      {/* Tabs Filter Bar (Semua, Tayang, Terjadwal, Draf, Sampah) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => {
            setActiveTab('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Semua ({countAll})
        </button>
        <button
          onClick={() => {
            setActiveTab('PUBLISHED');
            setCurrentPage(1);
          }}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'PUBLISHED'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Tayang ({countPublished})
        </button>
        <button
          onClick={() => {
            setActiveTab('SCHEDULED');
            setCurrentPage(1);
          }}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'SCHEDULED'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Terjadwal ({countScheduled})
        </button>
        <button
          onClick={() => {
            setActiveTab('DRAFT');
            setCurrentPage(1);
          }}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'DRAFT'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Draf ({countDraft})
        </button>
        <button
          onClick={() => {
            setActiveTab('TRASHED');
            setCurrentPage(1);
          }}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'TRASHED'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sampah ({countTrashed})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul, kata kunci ringkasan, atau tag..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                aria-label="Filter kategori"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentName ? `— ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Dropdown */}
            <div>
              <select
                aria-label="Filter penulis"
                value={selectedAuthor}
                onChange={(e) => {
                  setSelectedAuthor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Penulis</option>
                {authors.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
              konten dipilih
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab !== 'TRASHED' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('PUBLISHED')}
                  className="text-xs"
                >
                  Terbitkan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('DRAFT')}
                  className="text-xs"
                >
                  Jadikan Draf
                </Button>
                <div className="flex items-center gap-1">
                  <select
                    aria-label="Pilih kategori massal"
                    value={bulkCategoryTarget}
                    onChange={(e) => {
                      setBulkCategoryTarget(e.target.value);
                      handleBulkCategoryChange(e.target.value);
                    }}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1"
                  >
                    <option value="">Ubah Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleBulkTrash}
                  className="text-xs"
                >
                  Pindahkan ke Sampah
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleBulkRestore}
                  className="text-xs gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pulihkan Semua</span>
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleBulkPermanentDelete}
                  className="text-xs"
                >
                  Hapus Permanen
                </Button>
              </>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:underline px-2"
            >
              Batalkan
            </button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua baris"
                    checked={
                      displayedPosts.length > 0 &&
                      displayedPosts.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-3">Judul Konten</th>
                <th className="p-3">Kategori & Tag</th>
                <th className="p-3">Penulis</th>
                <th className="p-3">Status</th>
                <th className="p-3">Dibaca</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <EmptyState
                      title="Tidak ada konten ditemukan"
                      description="Coba ubah kata kunci pencarian atau ganti filter status dan kategori."
                      action={
                        canCreate ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              onNavigate(
                                postTypeFilter === 'NEWS'
                                  ? 'admin-news-create'
                                  : 'admin-post-create'
                              )
                            }
                          >
                            Tulis Sekarang
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                displayedPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        aria-label={`Pilih konten ${post.title}`}
                        checked={selectedIds.includes(post.id)}
                        onChange={() => handleToggleSelectOne(post.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 max-w-sm">
                      <div className="flex items-start gap-3">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {post.title}
                            </span>
                            {post.isFeatured && (
                              <span
                                title="Konten Utama Unggulan di Beranda"
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                Unggulan
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <Badge variant="blue" className="text-[10px]">
                          {post.categoryName || 'Tanpa Kategori'}
                        </Badge>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-600 dark:text-slate-400"
                              >
                                #{t}
                              </span>
                            ))}
                            {post.tags.length > 2 && (
                              <span className="text-[9px] text-slate-400">
                                +{post.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {post.authorName || 'Anonim'}
                      </span>
                    </td>
                    <td className="p-3">{getStatusBadge(post)}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {(post.views || 0).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-[11px] text-slate-500">
                      {post.status === 'SCHEDULED' && post.scheduledAt ? (
                        <div className="text-blue-600 dark:text-blue-400 font-semibold">
                          Tayang: {formatDate(post.scheduledAt)}
                        </div>
                      ) : (
                        formatDate(post.publishedAt || post.createdAt)
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle Featured */}
                        {post.status === 'PUBLISHED' && canEdit && (
                          <button
                            onClick={() => handleToggleFeatured(post)}
                            title={
                              post.isFeatured
                                ? 'Hapus dari sorotan utama'
                                : 'Jadikan sorotan utama beranda'
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              post.isFeatured
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Preview */}
                        <button
                          onClick={() => onNavigate('preview-content', post.slug)}
                          title="Lihat Pratinjau Konten"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit or Restore */}
                        {post.status !== 'TRASHED' ? (
                          <>
                            {canEdit && (
                              <button
                                onClick={() =>
                                  onNavigate(
                                    post.type === 'NEWS'
                                      ? 'admin-news-edit'
                                      : 'admin-post-edit',
                                    post.id
                                  )
                                }
                                title="Edit Konten"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleTrashSingle(post)}
                                title="Pindahkan ke Sampah"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestoreSingle(post)}
                              title="Pulihkan Konten"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handlePermanentDeleteSingle(post)}
                                title="Hapus Permanen"
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Menampilkan {displayedPosts.length} dari {filteredPosts.length} konten
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 font-bold">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && postToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Konfirmasi Hapus Permanen"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus permanen konten{' '}
              <strong className="text-slate-900 dark:text-white">
                "{postToDelete.title}"
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
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
                onClick={handleConfirmPermanentDelete}
              >
                Hapus Permanen
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
