import React, { useState } from 'react';
import { Bell, FileText, Download, Calendar, Search, ArrowRight } from 'lucide-react';
import { Post, ActiveNav } from '../../types';
import { formatDate } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface AnnouncementViewProps {
  posts: Post[];
  onNavigate: (nav: ActiveNav, slug?: string) => void;
}

export const AnnouncementView: React.FC<AnnouncementViewProps> = ({
  posts,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const announcements = posts.filter(
    (p) =>
      p.status === 'PUBLISHED' &&
      (p.categoryName === 'Pengumuman Resmi' || p.title.toLowerCase().includes('pengumuman') || p.title.toLowerCase().includes('jadwal'))
  );

  const filtered = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="danger">Informasi Terpadu</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pengumuman & Surat Edaran Resmi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Surat edaran kepala sekolah, kebijakan akademik, tata tertib, dan informasi resmi institusi.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nomor surat atau perihal pengumuman..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((item) => (
          <Card
            key={item.id}
            hoverEffect
            className="cursor-pointer"
            onClick={() => onNavigate('news-detail', item.slug)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="danger" size="sm">
                        Surat Edaran
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDate(item.publishedAt || item.createdAt, 'full')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-2xl">{item.excerpt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('news-detail', item.slug);
                    }}
                    className="text-xs gap-1.5"
                  >
                    <span>Buka Rincian</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
