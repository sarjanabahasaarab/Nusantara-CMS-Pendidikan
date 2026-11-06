import React from 'react';
import {
  GraduationCap,
  Target,
  Users,
  Compass,
  CheckCircle,
  Building,
} from 'lucide-react';
import { SiteSetting, Page } from '../../types';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface AboutViewProps {
  settings: SiteSetting;
  pages: Page[];
}

export const AboutView: React.FC<AboutViewProps> = ({ settings, pages }) => {
  const missionItems = settings.mission
    ? settings.mission
        .split('\n')
        .map((m) => m.trim())
        .filter(Boolean)
    : [
        'Menyelenggarakan pembelajaran berkualitas yang berpusat pada murid.',
        'Mengembangkan potensi bakat sains, teknologi, seni, dan kepemimpinan.',
        'Membangun ekosistem sekolah yang berintegritas, ramah anak, dan peduli lingkungan.',
      ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="info">Profil Institusi</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Mengenal Lebih Dekat {settings.siteName}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {settings.tagline}
        </p>
      </div>

      {/* Visi & Misi Dinamis dari Pengaturan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-t-4 border-t-blue-600 shadow-sm">
          <CardContent className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visi Sekolah</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              "{settings.vision || settings.description}"
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-indigo-600 shadow-sm">
          <CardContent className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Misi Sekolah</h2>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {missionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item.replace(/^\d+[\.\)]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Falsafah Pendidikan */}
      {settings.educationalPhilosophy && (
        <div className="bg-blue-50 dark:bg-blue-950/40 rounded-3xl p-8 border border-blue-200 dark:border-blue-900/60 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Falsafah Pendidikan Institusi
          </span>
          <p className="text-lg font-semibold text-slate-900 dark:text-white max-w-2xl mx-auto">
            "{settings.educationalPhilosophy}"
          </p>
        </div>
      )}

      {/* Nilai-Nilai Luhur */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="purple">Karakter Siswa</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Pilar Nilai Luhur Nusantara
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl font-black text-blue-600">01</span>
            <h4 className="font-bold text-slate-900 dark:text-white">Integritas & Budi Luhur</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menjunjung kejujuran, tanggung jawab, dan adab mulia dalam setiap langkah.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl font-black text-indigo-600">02</span>
            <h4 className="font-bold text-slate-900 dark:text-white">Daya Pikir Kritis</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mampu menganalisis masalah secara ilmiah, objektif, dan solutif.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl font-black text-emerald-600">03</span>
            <h4 className="font-bold text-slate-900 dark:text-white">Kolaborasi & Empati</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bekerja sama melintasi perbedaan dengan semangat Bhinneka Tunggal Ika.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl font-black text-amber-600">04</span>
            <h4 className="font-bold text-slate-900 dark:text-white">Wawasan Global</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Siap bersaing di kancah dunia dengan tetap bangga pada budaya nusantara.
            </p>
          </div>
        </div>
      </div>

      {/* Pimpinan Sekolah dari Pengaturan */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="info">Pimpinan & Manajemen</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Pimpinan Sekolah
          </h2>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="text-center p-6 space-y-3">
            <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-blue-500 shadow-md bg-slate-100 dark:bg-slate-800">
              <img
                src={
                  settings.principalImage ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
                }
                alt={settings.principalName || 'Kepala Sekolah'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {settings.principalName}
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {settings.principalTitle}
              </p>
            </div>
            {settings.principalQuote && (
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "{settings.principalQuote}"
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
