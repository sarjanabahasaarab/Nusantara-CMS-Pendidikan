import React from 'react';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Award,
  Globe,
} from 'lucide-react';
import { SiteSetting, ActiveNav } from '../../types';

interface PublicFooterProps {
  settings: SiteSetting;
  onNavigate: (nav: ActiveNav) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  settings,
  onNavigate,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Kolom 1: Profil Sekolah */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight">
                  {settings.siteName}
                </h3>
                <p className="text-xs text-blue-400 font-medium">
                  Institusi Pendidikan Rujukan Nasional
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.description}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{settings.accreditation || 'Akreditasi Unggul (A)'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400">
                <Award className="w-4 h-4 text-blue-400" />
                <span>NPSN: {settings.npsn || '20108922'}</span>
              </div>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Tentang & Sejarah
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Kabar & Artikel Berita
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Pengumuman Resmi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('agenda')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Kalender & Agenda
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan & Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Portal Terpadu
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <span>Portal Administrator CMS</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <span className="text-slate-500 text-xs">Portal Siswa & Raport (Fase 2)</span>
              </li>
              <li>
                <span className="text-slate-500 text-xs">Portal Guru & KBM (Fase 2)</span>
              </li>
              <li>
                <span className="text-slate-500 text-xs">Pendaftaran Siswa Baru / PPDB (Fase 3)</span>
              </li>
              <li>
                <span className="text-slate-500 text-xs">Perpustakaan Digital (Fase 4)</span>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Kontak & Jam Operasional */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Sekretariat Sekolah
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-500 font-medium block mb-2">Media Sosial:</span>
              <div className="flex items-center space-x-3 text-slate-400">
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-400 transition-colors text-xs bg-slate-900 p-2 rounded-md border border-slate-800"
                    title="Facebook"
                  >
                    FB
                  </a>
                )}
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-pink-400 transition-colors text-xs bg-slate-900 p-2 rounded-md border border-slate-800"
                    title="Instagram"
                  >
                    IG
                  </a>
                )}
                {settings.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-red-400 transition-colors text-xs bg-slate-900 p-2 rounded-md border border-slate-800"
                    title="YouTube"
                  >
                    YT
                  </a>
                )}
                {settings.tiktok && (
                  <a
                    href={settings.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-slate-200 transition-colors text-xs bg-slate-900 p-2 rounded-md border border-slate-800"
                    title="TikTok"
                  >
                    TT
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar Copyright & Open Source Attribution */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            {settings.footerCopyright || `© ${new Date().getFullYear()} ${settings.siteName}. Seluruh Hak Cipta Dilindungi Undang-Undang.`}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Globe className="w-3.5 h-3.5" />
              Nusantara Education CMS (Phase 1 Open-Source Foundation)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
