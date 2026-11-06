import React, { useState } from 'react';
import { Search, Calendar, User, ArrowRight, Tag, Filter, Newspaper, FileText } from 'lucide-react';
import { Post, Category, ActiveNav, ContentType } from '../../types';
import { formatDate, truncateText } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { EmptyState } from '../ui/EmptyState';

interface NewsViewProps {
  posts: Post[];
  categories: Category[];
  contentType?: ContentType;
  onNavigate: (nav: ActiveNav, slug?: string) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  posts,
  categories,
  contentType,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter artikel yang PUBLISHED dan sesuai tipe
  const now = new Date();
  const publishedPosts = posts.filter((p) => {
    if (p.status !== 'PUBLISHED') return false;
    if (contentType && p.type !== contentType) return false;
    if (p.scheduledAt && new Date(p.scheduledAt) > now) return false;
    return true;
  });

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'ALL' || post.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="blue">
          {contentType === 'ARTICLE' ? 'Artikel Edukasi' : contentType === 'NEWS' ? 'Warta Kampus' : 'Warta & Edukasi'}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {contentType === 'ARTICLE'
            ? 'Artikel & Esai Edukasi Sekolah'
            : contentType === 'NEWS'
            ? 'Warta Berita & Informasi Terkini'
            : 'Berita & Artikel Pendidikan'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {contentType === 'ARTICLE'
            ? 'Refleksi gagasan ilmiah, panduan pedagogik, modul ajar kurikulum merdeka, dan karya tulis siswa.'
            : 'Publikasi kabar terbaru, pencapaian prestasi siswa, agenda kependidikan, dan kegiatan civitas akademika.'}
        </p>
      </div>

      {/* Filter & Pencarian Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <Button
            variant={selectedCategory === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('ALL');
              setCurrentPage(1);
            }}
            className="text-xs shrink-0"
          >
            Semua Kategori
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className="text-xs shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul atau topik..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Grid Artikel */}
      {displayedPosts.length === 0 ? (
        <EmptyState
          title="Tidak ada konten yang sesuai"
          description="Coba ubah kata kunci pencarian Anda atau pilih kategori lainnya."
          actionLabel="Reset Pencarian"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPosts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col cursor-pointer group hover:shadow-lg transition-all"
              onClick={() => onNavigate('news-detail', post.slug)}
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={
                    post.featuredImage ||
                    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600'
                  }
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="blue" size="sm">
                    {post.categoryName || 'Warta'}
                  </Badge>
                </div>
              </div>

              <CardContent className="flex-1 flex flex-col justify-between p-5 space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.publishedAt || post.createdAt, 'short')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 line-clamp-1">
                      <User className="w-3.5 h-3.5" />
                      {post.authorName}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
