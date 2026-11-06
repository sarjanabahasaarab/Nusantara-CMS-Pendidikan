import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface EventItem {
  id: string;
  title: string;
  category: string;
  day: string;
  month: string;
  time: string;
  location: string;
  description: string;
}

export const AgendaView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState('ALL');

  const events: EventItem[] = [
    {
      id: 'ev-1',
      title: 'Penilaian Sumatif Akhir Semester (PSAS) Ganjil 2026',
      category: 'Akademik',
      day: '01',
      month: 'DES',
      time: '07.30 - 12.30 WIB',
      location: 'Ruang Ujian Digital & Lab CBT',
      description: 'Evaluasi capaian belajar murid semester ganjil berbasis Computer-Based Test (CBT) mandiri.',
    },
    {
      id: 'ev-2',
      title: 'Pameran Karya Inovasi Sains & Teknologi Siswa Nusantara',
      category: 'Prestasi & Karya',
      day: '12',
      month: 'DES',
      time: '08.30 - 15.00 WIB',
      location: 'Graha Nusantara Hall & Lapangan Terbuka',
      description: 'Presentasi prototipe robotika, sains bioteknologi, dan karya seni digital civitas siswa.',
    },
    {
      id: 'ev-3',
      title: 'Rapat Pleno Kenaikan & Pembagian Raport Semester Ganjil',
      category: 'Akademik',
      day: '18',
      month: 'DES',
      time: '08.00 - 11.30 WIB',
      location: 'Ruang Kelas Masing-Masing',
      description: 'Pertemuan orang tua/wali murid dengan wali kelas untuk evaluasi hasil belajar semester 1.',
    },
    {
      id: 'ev-4',
      title: 'Libur Akhir Semester Ganjil & Tahun Baru 2027',
      category: 'Libur Resmi',
      day: '21',
      month: 'DES',
      time: '21 Des 2026 - 04 Jan 2027',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur jeda semester bagi seluruh siswa dan pembinaan daring bagi guru pendidik.',
    },
    {
      id: 'ev-5',
      title: 'Hari Pertama Masuk KBM Semester Genap 2026/2027',
      category: 'Akademik',
      day: '05',
      month: 'JAN',
      time: '06.45 WIB - Selesai',
      location: 'Lapangan Upacara Kampus Nusantara',
      description: 'Upacara bendera gabungan dan jam tatap muka perdana semester genap.',
    },
  ];

  const filteredEvents =
    filterCategory === 'ALL'
      ? events
      : events.filter((ev) => ev.category === filterCategory);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="purple">Kalender Pendidikan</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Agenda & Jadwal Kegiatan Sekolah
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kalender resmi seluruh kegiatan akademik, evaluasi pembelajaran, peringatan hari besar, dan pertemuan wali murid.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2">
        {['ALL', 'Akademik', 'Prestasi & Karya', 'Libur Resmi'].map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(cat)}
            className="text-xs"
          >
            {cat === 'ALL' ? 'Semua Kategori' : cat}
          </Button>
        ))}
      </div>

      {/* List Events */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredEvents.map((ev) => (
          <Card key={ev.id} hoverEffect className="shadow-xs">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Date Box */}
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <span className="text-xs font-bold uppercase">{ev.month}</span>
                  <span className="text-2xl font-black leading-none">{ev.day}</span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">
                      {ev.category}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{ev.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {ev.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {ev.location}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
