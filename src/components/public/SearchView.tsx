import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Newspaper,
  Layers,
  Megaphone,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ActiveNav } from '../../types';
import { cmsStore } from '../../lib/db';
import { formatDate } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface SearchViewProps {
  initialQuery?: string;
  onNavigate: (nav: ActiveNav, slug?: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ARTICLES' | 'NEWS' | 'PAGES' | 'ANNOUNCEMENTS' | 'EVENTS' | 'GALLERY'>('ALL');

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const searchResults = cmsStore.globalSearch(query);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Header & Search Bar */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Pencarian Terpadu Portal Sekolah
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Temukan warta berita, karya artikel guru & siswa, surat pengumuman resmi, jadwal agenda, dan dokumentasi foto.
        </p>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ketik kata kunci pencarian (misal: Robotika, PPDB, Kurikulum, Festival)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm rounded-2xl pl-12 pr-4 py-3.5 shadow-md shadow-blue-500/5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Semua ({searchResults.total})
        </button>
        <button
          onClick={() => setActiveTab('NEWS')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'NEWS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Berita ({searchResults.news.length})
        </button>
        <button
          onClick={() => setActiveTab('ARTICLES')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ARTICLES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Artikel ({searchResults.articles.length})
        </button>
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Pengumuman ({searchResults.announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'EVENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Agenda ({searchResults.events.length})
        </button>
        <button
          onClick={() => setActiveTab('PAGES')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'PAGES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Halaman ({searchResults.pages.length})
        </button>
        <button
          onClick={() => setActiveTab('GALLERY')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'GALLERY'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Galeri ({searchResults.gallery.length})
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {searchResults.total === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <EmptyState
                title="Tidak ada hasil yang cocok"
                description={`Tidak ditemukan konten yang cocok dengan kata kunci "${query}". Cobalah kata kunci umum seperti 'robot', 'prestasi', 'ujian', atau 'sekolah'.`}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 1. NEWS RESULTS */}
            {(activeTab === 'ALL' || activeTab === 'NEWS') &&
              searchResults.news.map((n) => (
                <Card
                  key={n.id}
                  onClick={() => onNavigate('news-detail', n.slug)}
                  className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="green" className="text-[10px] flex items-center gap-1">
                          <Newspaper className="w-3 h-3" />
                          <span>Warta Berita</span>
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(n.publishedAt || n.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {n.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{n.excerpt}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              ))}

            {/* 2. ARTICLES RESULTS */}
            {(activeTab === 'ALL' || activeTab === 'ARTICLES') &&
              searchResults.articles.map((a) => (
                <Card
                  key={a.id}
                  onClick={() => onNavigate('news-detail', a.slug)}
                  className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" className="text-[10px] flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Artikel Edukasi</span>
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(a.publishedAt || a.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{a.excerpt}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              ))}

            {/* 3. ANNOUNCEMENTS RESULTS */}
            {(activeTab === 'ALL' || activeTab === 'ANNOUNCEMENTS') &&
              searchResults.announcements.map((ann) => (
                <Card
                  key={ann.id}
                  onClick={() => onNavigate('announcements')}
                  className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="amber" className="text-[10px] flex items-center gap-1">
                          <Megaphone className="w-3 h-3" />
                          <span>Pengumuman</span>
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(ann.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{ann.content}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              ))}

            {/* 4. EVENTS RESULTS */}
            {(activeTab === 'ALL' || activeTab === 'EVENTS') &&
              searchResults.events.map((ev) => (
                <Card
                  key={ev.id}
                  onClick={() => onNavigate('agenda-detail', ev.slug)}
                  className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" className="text-[10px] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Agenda: {formatDate(ev.startDate)}</span>
                        </Badge>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              ))}

            {/* 5. PAGES RESULTS */}
            {(activeTab === 'ALL' || activeTab === 'PAGES') &&
              searchResults.pages.map((p) => (
                <Card
                  key={p.id}
                  onClick={() => onNavigate('about')}
                  className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <Badge variant="gray" className="text-[10px] flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Halaman Statis</span>
                      </Badge>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.excerpt}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              ))}

            {/* 6. GALLERY RESULTS */}
            {(activeTab === 'ALL' || activeTab === 'GALLERY') &&
              searchResults.gallery.map((g) => (
                <Card
                  key={g.id}
                  onClick={() => onNavigate('gallery-detail', g.slug)}
                  className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <Badge variant="blue" className="text-[10px] flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Album Galeri ({g.photosCount} foto)</span>
                      </Badge>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {g.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              ))}
          </>
        )}
      </div>
    </div>
  );
};
