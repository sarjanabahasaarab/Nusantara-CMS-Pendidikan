import React, { useState } from 'react';
import {
  Globe,
  FileCode,
  Search,
  CheckCircle,
  Copy,
  ExternalLink,
  Code,
  AlertCircle,
} from 'lucide-react';
import { SiteSetting, ActiveNav } from '../../types';
import { cmsStore } from '../../lib/db';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface GlobalSeoManagementProps {
  settings: SiteSetting;
  onNavigate: (nav: ActiveNav) => void;
}

export const GlobalSeoManagement: React.FC<GlobalSeoManagementProps> = ({
  settings,
  onNavigate,
}) => {
  const { user } = useAuth();

  const [metaTitle, setMetaTitle] = useState(settings.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(settings.metaDescription || '');
  const [robotsTxt, setRobotsTxt] = useState(
    `# Nusantara Education CMS - robots.txt
User-agent: *
Allow: /
Allow: /berita/
Allow: /artikel/
Allow: /pengumuman/
Allow: /agenda/
Allow: /galeri/
Allow: /tentang/
Allow: /kontak/

Disallow: /admin/
Disallow: /api/
Disallow: /login/

Sitemap: https://sman-nusantara.sch.id/sitemap.xml`
  );

  const [savedToast, setSavedToast] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const publicPosts = cmsStore.getPublicPosts();
  const pages = cmsStore.getPages().filter((p) => p.status === 'PUBLISHED');
  const albums = cmsStore.getPublishedAlbums();
  const events = cmsStore.getEvents().filter((e) => e.status === 'PUBLISHED');

  const sitemapUrls = [
    { url: 'https://sman-nusantara.sch.id/', priority: '1.0', changefreq: 'daily' },
    { url: 'https://sman-nusantara.sch.id/tentang', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://sman-nusantara.sch.id/berita', priority: '0.9', changefreq: 'daily' },
    { url: 'https://sman-nusantara.sch.id/artikel', priority: '0.8', changefreq: 'weekly' },
    { url: 'https://sman-nusantara.sch.id/agenda', priority: '0.8', changefreq: 'weekly' },
    { url: 'https://sman-nusantara.sch.id/galeri', priority: '0.7', changefreq: 'weekly' },
    { url: 'https://sman-nusantara.sch.id/kontak', priority: '0.7', changefreq: 'monthly' },
    ...publicPosts.map((p) => ({
      url: `https://sman-nusantara.sch.id/${p.type === 'NEWS' ? 'berita' : 'artikel'}/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...pages.map((p) => ({
      url: `https://sman-nusantara.sch.id/${p.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
    })),
  ];

  const handleSave = () => {
    cmsStore.updateSettings(
      {
        metaTitle,
        metaDescription,
      },
      user
    );
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 1500);
  };

  return (
    <div className="space-y-6">
      {savedToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 z-50 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>Pengaturan SEO berhasil diperbarui!</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <span>SEO Global, Robots & Peta Situs (Sitemap)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi metadata mesin pencari, berkas robots.txt, dan generator sitemap.xml otomatis.
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} className="gap-2 font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>Simpan Perubahan SEO</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Meta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Metadata Situs Global</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Judul Utama Website (Meta Title)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Deskripsi Global (Meta Description)
              </label>
              <textarea
                rows={4}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Google SERP Preview */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 font-sans">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Cuplikan Beranda di Google
              </span>
              <p className="text-xs text-slate-500">https://sman-nusantara.sch.id</p>
              <p className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer truncate">
                {metaTitle}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                {metaDescription}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Robots.txt Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Berkas robots.txt</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              rows={10}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 block">
              Mengontrol crawler mesin pencari Google, Bing, Yahoo agar tidak mengindeks panel administrasi internal.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Sitemap Inspection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Inspeksi Peta Situs Dinamis (sitemap.xml — {sitemapUrls.length} URL Terdaftar)</span>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard('https://sman-nusantara.sch.id/sitemap.xml')}
              className="text-xs gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedUrl ? 'Tersalin!' : 'Salin URL Sitemap'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="p-2.5">Lokasi URL</th>
                  <th className="p-2.5">Frekuensi Perubahan</th>
                  <th className="p-2.5">Prioritas</th>
                  <th className="p-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {sitemapUrls.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 text-slate-800 dark:text-slate-200 truncate max-w-md">
                      {item.url}
                    </td>
                    <td className="p-2.5 text-slate-500">{item.changefreq}</td>
                    <td className="p-2.5 text-blue-600 font-bold">{item.priority}</td>
                    <td className="p-2.5 text-right font-sans">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="text-slate-400 hover:text-blue-600 p-1"
                        title="Salin tautan"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
