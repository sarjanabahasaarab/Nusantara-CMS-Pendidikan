import React from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Calendar,
  Bell,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  ChevronRight,
  Newspaper,
  Compass,
  FileText,
  MapPin,
  Clock,
  Camera,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { Post, SiteSetting, ActiveNav, Announcement, EventItem, GalleryAlbum } from '../../types';
import { formatDate, truncateText } from '../../lib/utils';
import { cmsStore } from '../../lib/db';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface HomeViewProps {
  settings: SiteSetting;
  posts: Post[];
  onNavigate: (nav: ActiveNav, postSlug?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  posts,
  onNavigate,
}) => {
  // Public published posts only (respecting scheduledAt)
  const publicPosts = cmsStore.getPublicPosts();
  const featuredPost = cmsStore.getFeaturedPosts()[0] || publicPosts[0];
  const latestNews = publicPosts.filter((p) => p.type === 'NEWS' && p.id !== featuredPost?.id).slice(0, 3);
  const latestArticles = publicPosts.filter((p) => p.type === 'ARTICLE' && p.id !== featuredPost?.id).slice(0, 3);

  // Active Announcements, Events & Albums
  const activeAnnouncements = cmsStore.getActiveAnnouncements().slice(0, 3);
  const upcomingEvents = cmsStore.getUpcomingEvents().slice(0, 3);
  const publishedAlbums = cmsStore.getPublishedAlbums().slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {settings.ppdbActive && (
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{settings.ppdbNotice || 'Penerimaan Peserta Didik Baru (PPDB) Telah Dibuka'}</span>
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                {settings.siteName}{' '}
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                  {settings.tagline}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                {settings.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate('contact')}
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 font-semibold"
                >
                  {settings.ppdbCtaText || 'Daftar PPDB Online'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('about')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xs"
                >
                  Profil & Visi Misi
                </Button>
              </div>

              {/* Akreditasi badge bar */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-slate-800">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {settings.accreditation || 'Terakreditasi A (Unggul)'}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  NPSN: {settings.npsn || '20108922'}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {settings.accreditationBody || 'BAN-PDM Kemendikbudristek'}
                </span>
              </div>
            </div>

            {/* Kolom Kanan: Kartu Sambutan Kepala Sekolah */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={settings.principalImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'}
                    alt={settings.principalName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      {settings.principalName}
                    </h3>
                    <p className="text-xs text-blue-400 font-semibold">
                      {settings.principalTitle}
                    </p>
                  </div>
                </div>

                <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed border-l-2 border-blue-500 pl-3 my-4">
                  "{settings.principalQuote}"
                </blockquote>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {settings.principalWelcomeMessage}
                </p>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pesan Kepala Sekolah</span>
                  <button
                    onClick={() => onNavigate('about')}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Baca Sambutan Lengkap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTIK INSTITUSI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {settings.stat1Value || '1.250+'}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{settings.stat1Label || 'Peserta Didik'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {settings.stat2Value || '85+'}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{settings.stat2Label || 'Guru Ahli & Pendidik'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {settings.stat3Value || '142+'}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{settings.stat3Label || 'Prestasi Kejuaraan'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {settings.stat4Value || '98.4%'}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{settings.stat4Label || 'Lulusan PTN & Global'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LEAD ARTICLE & HEADLINE STORY */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Sorotan Utama (Featured Story)
              </h2>
            </div>
            <Badge variant="blue">Unggulan</Badge>
          </div>

          <Card
            onClick={() => onNavigate('news-detail', featuredPost.slug)}
            className="overflow-hidden group hover:shadow-xl transition-all cursor-pointer border-slate-200 dark:border-slate-800"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 h-64 sm:h-96 lg:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={featuredPost.featuredImage || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={featuredPost.type === 'NEWS' ? 'green' : 'blue'}>
                      {featuredPost.type === 'NEWS' ? 'Warta Berita' : 'Artikel'}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                    </span>
                    <span className="text-xs text-slate-400">• {featuredPost.views || 0} views</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                    {featuredPost.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  {featuredPost.tags && featuredPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {featuredPost.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* 4. BERITA TERBARU & PENGUMUMAN RESMI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Warta Berita (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Warta Berita Sekolah Terkini
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('news')}
                className="text-xs text-blue-600 gap-1"
              >
                <span>Lihat Semua Berita</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestNews.map((post) => (
                <Card
                  key={post.id}
                  onClick={() => onNavigate('news-detail', post.slug)}
                  className="overflow-hidden group hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                        <span className="text-blue-600 font-bold">{post.categoryName}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishedAt || post.createdAt, 'short')}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="text-[11px] font-bold text-blue-600 pt-2 flex items-center justify-between">
                      <span>Baca Rincian</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Pengumuman Resmi (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pengumuman Resmi
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('announcements')}
                className="text-xs text-blue-600"
              >
                Semua
              </Button>
            </div>

            <div className="space-y-3">
              {activeAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => onNavigate('announcements')}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        ann.priority === 'URGENT'
                          ? 'red'
                          : ann.priority === 'IMPORTANT'
                          ? 'amber'
                          : 'blue'
                      }
                      className="text-[9px]"
                    >
                      {ann.priority === 'URGENT' ? 'Mendesak' : ann.priority === 'IMPORTANT' ? 'Penting' : 'Pengumuman'}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(ann.createdAt, 'short')}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                    {ann.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. AGENDA & KALENDER KEGIATAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl sm:text-2xl font-black">Agenda & Kalender Sekolah</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Jadwal kompetisi, seminar teknologi, evaluasi sumatif, dan temu komite wali murid.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('agenda')}
              className="text-white border-slate-700 hover:bg-slate-800 shrink-0 text-xs"
            >
              Lihat Kalender Lengkap
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onNavigate('agenda-detail', ev.slug)}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:border-blue-400 transition-colors cursor-pointer space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold uppercase">
                      {new Date(ev.startDate).toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black leading-none">
                      {new Date(ev.startDate).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="blue" className="text-[9px] mb-1">
                      {ev.category}
                    </Badge>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {ev.title}
                    </h4>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-700/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>
                      {ev.allDay
                        ? 'Sepanjang Hari'
                        : new Date(ev.startDate).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) + ' WIB'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. GALERI FOTO KEGIATAN KAMPUS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Galeri & Dokumentasi Kegiatan
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Dokumentasi visual festival kebudayaan, kejuaraan robotik, dan pembelajaran sains.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('gallery')}
            className="text-xs text-blue-600 gap-1"
          >
            <span>Buka Semua Album</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {publishedAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => onNavigate('gallery-detail', album.slug)}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <img
                src={album.coverImage}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-3 text-white">
                <span className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {album.photosCount || 0} Foto
                </span>
                <span className="text-xs font-bold line-clamp-1 mt-0.5">{album.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA BANNER PPDB DARI PENGATURAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-8 sm:p-14 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Siap Menjadi Bagian dari Keluarga Besar {settings.siteName}?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              {settings.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('contact')}
                className="bg-white text-blue-900 hover:bg-slate-100 shadow-md font-bold"
              >
                {settings.ppdbCtaText || 'Hubungi Panitia PPDB'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('about')}
                className="border-white/40 text-white hover:bg-white/10"
              >
                Pelajari Kurikulum & Visi
              </Button>
            </div>
          </div>

          <Building2 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
        </div>
      </section>
    </div>
  );
};
