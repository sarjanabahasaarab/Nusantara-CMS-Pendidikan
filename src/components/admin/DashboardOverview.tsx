import React from 'react';
import {
  FileText,
  Layers,
  Users,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Post, Page, Media, User, AuditLog, ActiveNav } from '../../types';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

interface DashboardOverviewProps {
  posts: Post[];
  pages: Page[];
  media: Media[];
  users: User[];
  auditLogs: AuditLog[];
  onNavigate: (nav: ActiveNav, slugOrId?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  posts,
  pages,
  media,
  users,
  auditLogs,
  onNavigate,
}) => {
  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length;
  const activeUsersCount = users.filter((u) => u.isActive).length;

  const recentPosts = posts.slice(0, 5);
  const recentLogs = auditLogs.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-blue-100 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nusantara Education CMS — Versi Fondasi Phase 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Panel Pengelolaan Sekolah
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            Kelola publikasi warta pendidikan, halaman profil sekolah, pustaka berkas, dan akun pengguna institusi secara terpadu.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('admin-post-create')}
              className="bg-white text-blue-900 hover:bg-slate-100 font-bold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Baru</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('admin-media')}
              className="border-white/40 text-white hover:bg-white/10 gap-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Unggah Berkas</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Statistik Utama Berdasarkan Basis Data Riil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Artikel */}
        <Card hoverEffect className="cursor-pointer" onClick={() => onNavigate('admin-posts')}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total Artikel & Berita
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {posts.length}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="text-emerald-600 font-semibold">{publishedCount} Tayang</span>
                <span>•</span>
                <span className="text-amber-600 font-semibold">{draftCount} Draf</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Halaman */}
        <Card hoverEffect className="cursor-pointer" onClick={() => onNavigate('admin-pages')}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Halaman Profil CMS
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {pages.length}
              </div>
              <div className="text-[11px] text-slate-500">
                Statis & SEO Teroptimasi
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pengguna */}
        <Card hoverEffect className="cursor-pointer" onClick={() => onNavigate('admin-users')}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Pengguna Terdaftar
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {users.length}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {activeUsersCount} Akun Aktif
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card hoverEffect className="cursor-pointer" onClick={() => onNavigate('admin-media')}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Pustaka Berkas & Foto
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {media.length}
              </div>
              <div className="text-[11px] text-slate-500">
                Storage Provider Siap
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: 2 Kolom (Artikel Terbaru vs Aktivitas Audit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom 1: Tabel Artikel Terbaru (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Artikel & Berita Terbaru</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publikasi warta terakhir dari ruang redaksi sekolah
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-posts')}
                className="text-xs text-blue-600 gap-1"
              >
                <span>Kelola Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {recentPosts.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="Belum ada artikel di basis data"
                    description="Mulai publikasikan warta kegiatan sekolah pertama Anda hari ini."
                    actionLabel="Tulis Artikel"
                    onAction={() => onNavigate('admin-post-create')}
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <img
                            src={
                              post.featuredImage ||
                              'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200'
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{post.categoryName}</span>
                            <span>•</span>
                            <span>{formatDate(post.publishedAt || post.createdAt, 'short')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={post.status === 'PUBLISHED' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {post.status === 'PUBLISHED' ? 'Tayang' : 'Draf'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate('admin-post-edit', post.id)}
                          className="text-xs h-7 px-2"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Aktivitas Audit & Sistem (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Rekaman Audit Aktivitas</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jejak keamanan dan modifikasi data pengguna
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-audit')}
                className="text-xs text-blue-600 gap-1"
              >
                <span>Semua Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {log.details}
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Oleh: {log.userName}</span>
                    <span className="font-mono">{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
