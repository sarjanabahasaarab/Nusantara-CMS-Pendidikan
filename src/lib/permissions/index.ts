/**
 * Nusantara Education CMS - Role Based Access Control (RBAC) & Data Privacy Engine
 * Phase 3 - Advanced Educational User Management & Granular Authorization
 */

import { PermissionCode, RoleName, User } from '../../types';

export interface PermissionDefinition {
  code: PermissionCode;
  label: string;
  description: string;
  module: string;
}

/**
 * Seluruh daftar perizinan sistem terkelompok secara modular
 */
export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // 1. Dashboard
  {
    code: 'dashboard.view',
    label: 'Lihat Dashboard',
    description: 'Akses masuk ke panel ringkasan dashboard CMS',
    module: 'Dashboard',
  },

  // 2. Pengguna & Keamanan Akun
  {
    code: 'users.view',
    label: 'Lihat Daftar Pengguna',
    description: 'Melihat direktori seluruh akun pengguna sistem',
    module: 'Pengguna',
  },
  {
    code: 'users.create',
    label: 'Tambah Akun Pengguna',
    description: 'Mendaftarkan akun pengguna baru ke institusi',
    module: 'Pengguna',
  },
  {
    code: 'users.update',
    label: 'Ubah Data Akun',
    description: 'Mengubah nama, email, nomor HP, foto, dan status akun',
    module: 'Pengguna',
  },
  {
    code: 'users.delete',
    label: 'Hapus / Arsipkan Pengguna',
    description: 'Menonaktifkan atau menghapus akun pengguna secara aman',
    module: 'Pengguna',
  },
  {
    code: 'users.import',
    label: 'Import Pengguna (CSV)',
    description: 'Mengunggah data batch guru, siswa, orang tua, dan staf via CSV',
    module: 'Pengguna',
  },
  {
    code: 'users.export',
    label: 'Export Data Pengguna',
    description: 'Mengekspor data direktori pengguna ke berkas CSV',
    module: 'Pengguna',
  },
  {
    code: 'users.block',
    label: 'Blokir / Buka Blokir Akun',
    description: 'Mengunci atau memulihkan akses login akun pengguna',
    module: 'Pengguna',
  },
  {
    code: 'users.reset_password',
    label: 'Reset Kata Sandi Pengguna',
    description: 'Menerbitkan tautan token sekali-pakai reset kata sandi',
    module: 'Pengguna',
  },

  // 3. Role & Otorisasi
  {
    code: 'roles.view',
    label: 'Lihat Daftar Role',
    description: 'Melihat hierarki role dan perannya di institusi',
    module: 'Otorisasi',
  },
  {
    code: 'roles.create',
    label: 'Tambah Role Kustom',
    description: 'Mendefinisikan peran baru sesuai struktur organisasi sekolah',
    module: 'Otorisasi',
  },
  {
    code: 'roles.update',
    label: 'Ubah Role & Deskripsi',
    description: 'Memperbarui nama, kode, dan status keaktifan role',
    module: 'Otorisasi',
  },
  {
    code: 'roles.delete',
    label: 'Hapus Role Kustom',
    description: 'Menghapus role kustom yang sudah tidak memiliki pengguna terikat',
    module: 'Otorisasi',
  },
  {
    code: 'permissions.view',
    label: 'Lihat Matriks Perizinan',
    description: 'Melihat pemetaan izin akses untuk setiap role',
    module: 'Otorisasi',
  },
  {
    code: 'permissions.manage',
    label: 'Kelola Matriks Izin',
    description: 'Mengubah alokasi izin akses granular per modul untuk setiap role',
    module: 'Otorisasi',
  },

  // 4. Pendidik & Guru
  {
    code: 'teachers.view',
    label: 'Lihat Direktori Guru',
    description: 'Melihat profil guru, kualifikasi, NIP/NUPTK, dan status kepegawaian',
    module: 'Tenaga Pendidik',
  },
  {
    code: 'teachers.create',
    label: 'Tambah Profil Guru',
    description: 'Mendaftarkan biodata profil guru baru ke database',
    module: 'Tenaga Pendidik',
  },
  {
    code: 'teachers.update',
    label: 'Ubah Profil Guru',
    description: 'Memperbarui data kepegawaian, gelar akademik, dan kontak guru',
    module: 'Tenaga Pendidik',
  },
  {
    code: 'teachers.delete',
    label: 'Hapus Profil Guru',
    description: 'Mengarsipkan data profil pendidik',
    module: 'Tenaga Pendidik',
  },

  // 5. Peserta Didik (Siswa)
  {
    code: 'students.view',
    label: 'Lihat Direktori Siswa',
    description: 'Melihat profil peserta didik, NIS/NISN, kelas, dan status kesiswaan',
    module: 'Peserta Didik',
  },
  {
    code: 'students.create',
    label: 'Tambah Profil Siswa',
    description: 'Mendaftarkan biodata siswa baru ke rombongan belajar',
    module: 'Peserta Didik',
  },
  {
    code: 'students.update',
    label: 'Ubah Profil Siswa',
    description: 'Memperbarui data kesiswaan, status mutasi, dan profil pribadi siswa',
    module: 'Peserta Didik',
  },
  {
    code: 'students.delete',
    label: 'Hapus / Mutasi Siswa',
    description: 'Mengubah status siswa menjadi pindah/lulus/nonaktif secara aman',
    module: 'Peserta Didik',
  },

  // 6. Orang Tua / Wali
  {
    code: 'parents.view',
    label: 'Lihat Profil Orang Tua',
    description: 'Melihat data kontak orang tua dan tautan ke anak/peserta didik',
    module: 'Orang Tua / Wali',
  },
  {
    code: 'parents.create',
    label: 'Tambah Profil Orang Tua',
    description: 'Mendaftarkan biodata orang tua atau wali murid',
    module: 'Orang Tua / Wali',
  },
  {
    code: 'parents.update',
    label: 'Ubah Profil Orang Tua',
    description: 'Memperbarui kontak dan relasi perwalian anak',
    module: 'Orang Tua / Wali',
  },
  {
    code: 'parents.delete',
    label: 'Hapus Profil Orang Tua',
    description: 'Menonaktifkan profil orang tua/wali murid',
    module: 'Orang Tua / Wali',
  },

  // 7. Tenaga Kependidikan (Staff)
  {
    code: 'staff.view',
    label: 'Lihat Tenaga Kependidikan',
    description: 'Melihat staf tata usaha, perpustakaan, laboran, dan sarpras',
    module: 'Tenaga Kependidikan',
  },
  {
    code: 'staff.create',
    label: 'Tambah Staf Kependidikan',
    description: 'Mendaftarkan staf baru ke unit kerja sekolah',
    module: 'Tenaga Kependidikan',
  },
  {
    code: 'staff.update',
    label: 'Ubah Data Staf',
    description: 'Mengubah unit jabatan, bidang tugas, dan status staf',
    module: 'Tenaga Kependidikan',
  },
  {
    code: 'staff.delete',
    label: 'Hapus Data Staf',
    description: 'Mengarsipkan data staf kependidikan',
    module: 'Tenaga Kependidikan',
  },

  // 8. Wali Kelas & Rombel
  {
    code: 'homeroom.view',
    label: 'Lihat Penugasan Wali Kelas',
    description: 'Melihat daftar penugasan guru sebagai wali kelas per tahun ajaran',
    module: 'Wali Kelas',
  },
  {
    code: 'homeroom.manage',
    label: 'Kelola Penugasan Wali Kelas',
    description: 'Menetapkan atau mengubah guru wali kelas untuk rombongan belajar',
    module: 'Wali Kelas',
  },

  // 9. Undangan Pengguna
  {
    code: 'invitations.create',
    label: 'Kirim Undangan Pengguna',
    description: 'Menerbitkan tiket undangan pembuatan akun mandiri via email',
    module: 'Pengguna',
  },
  {
    code: 'invitations.view',
    label: 'Pantau Status Undangan',
    description: 'Melihat daftar undangan aktif, kedaluwarsa, atau sudah diterima',
    module: 'Pengguna',
  },

  // 10. Konten Publikasi CMS
  {
    code: 'posts.view',
    label: 'Lihat Artikel & Berita',
    description: 'Melihat artikel, berita sekolah, draf, dan sampah',
    module: 'Konten',
  },
  {
    code: 'posts.create',
    label: 'Tulis Artikel & Berita',
    description: 'Membuat artikel atau berita baru',
    module: 'Konten',
  },
  {
    code: 'posts.update',
    label: 'Edit Artikel & Berita',
    description: 'Mengubah isi artikel, SEO, dan tag',
    module: 'Konten',
  },
  {
    code: 'posts.delete',
    label: 'Hapus Artikel & Berita',
    description: 'Memindahkan artikel ke tempat sampah atau hapus permanen',
    module: 'Konten',
  },
  {
    code: 'posts.publish',
    label: 'Publikasi & Penjadwalan',
    description: 'Menerbitkan atau menjadwalkan artikel/berita ke website publik',
    module: 'Konten',
  },
  {
    code: 'pages.view',
    label: 'Lihat Halaman Statis',
    description: 'Melihat daftar halaman profil sekolah',
    module: 'Konten',
  },
  {
    code: 'pages.create',
    label: 'Buat Halaman Statis',
    description: 'Membuat halaman baru (Visi Misi, Sejarah, dsb.)',
    module: 'Konten',
  },
  {
    code: 'pages.update',
    label: 'Edit Halaman Statis',
    description: 'Mengubah isi halaman profil sekolah',
    module: 'Konten',
  },
  {
    code: 'pages.delete',
    label: 'Hapus Halaman Statis',
    description: 'Menghapus halaman statis',
    module: 'Konten',
  },
  {
    code: 'announcements.manage',
    label: 'Kelola Pengumuman Resmi',
    description: 'Membuat dan menerbitkan surat edaran atau pengumuman prioritas',
    module: 'Konten',
  },
  {
    code: 'events.manage',
    label: 'Kelola Agenda Sekolah',
    description: 'Menyusun kalender akademik dan agenda kegiatan institusi',
    module: 'Konten',
  },
  {
    code: 'gallery.manage',
    label: 'Kelola Galeri Foto',
    description: 'Mengunggah dokumentasi album foto kegiatan',
    module: 'Konten',
  },

  // 11. Taksonomi, Media & Navigasi
  {
    code: 'categories.manage',
    label: 'Kelola Kategori',
    description: 'Mengatur kategori berjenjang dan metadata SEO-nya',
    module: 'Taksonomi',
  },
  {
    code: 'tags.manage',
    label: 'Kelola Tag',
    description: 'Mengelola tag kata kunci konten',
    module: 'Taksonomi',
  },
  {
    code: 'media.view',
    label: 'Lihat Pustaka Media',
    description: 'Membuka galeri media berkas institusi',
    module: 'Media',
  },
  {
    code: 'media.upload',
    label: 'Unggah Media',
    description: 'Mengunggah foto, dokumen PDF, dan berkas ke penyimpanan',
    module: 'Media',
  },
  {
    code: 'media.delete',
    label: 'Hapus Media',
    description: 'Menghapus berkas dari pustaka media',
    module: 'Media',
  },
  {
    code: 'menus.manage',
    label: 'Kelola Menu Navigasi',
    description: 'Menyusun hierarki menu navigasi website',
    module: 'Tampilan',
  },
  {
    code: 'comments.manage',
    label: 'Moderasi Komentar',
    description: 'Menyetujui, menandai spam, atau memoderasi komentar publik',
    module: 'Interaksi',
  },

  // 12. Pengaturan Situs & Audit Log
  {
    code: 'seo.manage',
    label: 'Kelola SEO & Sitemap',
    description: 'Mengatur robots.txt, dynamic sitemap, dan meta tag institusi',
    module: 'Pengaturan',
  },
  {
    code: 'settings.view',
    label: 'Lihat Pengaturan Situs',
    description: 'Melihat konfigurasi identitas sekolah',
    module: 'Pengaturan',
  },
  {
    code: 'settings.update',
    label: 'Ubah Pengaturan Situs',
    description: 'Mengubah nama sekolah, NPSN, akreditasi, logo, dan kontak',
    module: 'Pengaturan',
  },
  {
    code: 'audit.view',
    label: 'Lihat Log Audit & Aktivitas',
    description: 'Memantau rekaman keamanan dan jejak transaksi data seluruh pengguna',
    module: 'Keamanan',
  },

  // 13. Akademik & Raport (Fondasi Siap Pakai Phase 4)
  {
    code: 'attendance.view',
    label: 'Lihat Presensi Siswa',
    description: 'Melihat rekap kehadiran peserta didik',
    module: 'Akademik',
  },
  {
    code: 'attendance.mark',
    label: 'Catat Presensi Kelas',
    description: 'Mengisi presensi harian siswa rombongan belajar',
    module: 'Akademik',
  },
  {
    code: 'grades.view',
    label: 'Lihat Nilai & Raport',
    description: 'Melihat catatan penilaian dan rekap capaian belajar',
    module: 'Akademik',
  },
  {
    code: 'grades.input',
    label: 'Input Nilai Mata Pelajaran',
    description: 'Memasukkan nilai tugas, sumatif, dan ujian',
    module: 'Akademik',
  },
  {
    code: 'grades.update',
    label: 'Koreksi Nilai',
    description: 'Memperbaiki nilai hasil evaluasi belajar',
    module: 'Akademik',
  },
  {
    code: 'reports.view',
    label: 'Cetak Raport & Leger',
    description: 'Mencetak buku raport dan buku induk',
    module: 'Akademik',
  },
  {
    code: 'schedule.view',
    label: 'Lihat Jadwal Pelajaran',
    description: 'Melihat jadwal mata pelajaran kelas dan guru',
    module: 'Akademik',
  },
  {
    code: 'schedule.manage',
    label: 'Susun Jadwal Pelajaran',
    description: 'Mengatur alokasi waktu jam mengajar dan ruang kelas',
    module: 'Akademik',
  },
  {
    code: 'library.view',
    label: 'Katalog Perpustakaan',
    description: 'Melihat katalog buku dan pustaka digital',
    module: 'Sarpras',
  },
  {
    code: 'library.manage',
    label: 'Sirkulasi Perpustakaan',
    description: 'Melayani peminjaman dan pengembalian koleksi buku',
    module: 'Sarpras',
  },
  {
    code: 'finance.view',
    label: 'Laporan Keuangan & SPP',
    description: 'Melihat rekap pembayaran biaya pendidikan',
    module: 'Keuangan',
  },
  {
    code: 'finance.manage',
    label: 'Kelola Transaksi Keuangan',
    description: 'Menerbitkan tagihan dan mencatat penerimaan kas',
    module: 'Keuangan',
  },
  {
    code: 'ppdb.view',
    label: 'Lihat Pendaftar PPDB',
    description: 'Melihat data pendaftaran calon peserta didik baru',
    module: 'Kesiswaan',
  },
  {
    code: 'ppdb.manage',
    label: 'Seleksi & Verifikasi PPDB',
    description: 'Memverifikasi berkas dan menetapkan kelulusan seleksi PPDB',
    module: 'Kesiswaan',
  },

  // 14. Multi-Tenant & SaaS Platform (Phase 4)
  {
    code: 'tenants.view',
    label: 'Lihat Daftar Tenant Institusi',
    description: 'Melihat seluruh sekolah dan kampus terdaftar dalam platform SaaS',
    module: 'Multi-Tenant',
  },
  {
    code: 'tenants.manage',
    label: 'Kelola Tenant & Institusi',
    description: 'Menyetujui, memverifikasi, mengubah, atau membekukan tenant institusi',
    module: 'Multi-Tenant',
  },
  {
    code: 'subscriptions.manage',
    label: 'Kelola Paket Langganan & Kuota',
    description: 'Mengatur paket layanan (Free, Basic, Pro, Enterprise) dan batas pemakaian',
    module: 'Multi-Tenant',
  },
  {
    code: 'institution.manage',
    label: 'Kelola Profil & Identitas Institusi',
    description: 'Mengubah identitas sekolah/kampus, NPSN, akreditasi, logo, dan pimpinan',
    module: 'Institusi',
  },

  // 15. Tahun Ajaran & Semester (Phase 4)
  {
    code: 'academicyears.view',
    label: 'Lihat Tahun Ajaran',
    description: 'Melihat riwayat dan status tahun akademik institusi',
    module: 'Akademik',
  },
  {
    code: 'academicyears.manage',
    label: 'Kelola Tahun Ajaran',
    description: 'Menambah, mengaktifkan, dan menutup tahun akademik institusi',
    module: 'Akademik',
  },
  {
    code: 'academicterms.view',
    label: 'Lihat Semester / Periode',
    description: 'Melihat daftar semester ganjil/genap/pendek',
    module: 'Akademik',
  },
  {
    code: 'academicterms.manage',
    label: 'Kelola Semester & Periode',
    description: 'Mengatur periode perkuliahan/sekolah aktif',
    module: 'Akademik',
  },

  // 16. Struktur Pendidikan & Sarana (Phase 4)
  {
    code: 'academicstructure.view',
    label: 'Lihat Struktur Akademik',
    description: 'Melihat jenjang, fakultas, prodi, tingkat kelas, dan rombel',
    module: 'Struktur Akademik',
  },
  {
    code: 'academicstructure.manage',
    label: 'Kelola Struktur Akademik',
    description: 'Mengatur jenjang, fakultas, prodi, jurusan, dan rombongan belajar',
    module: 'Struktur Akademik',
  },
  {
    code: 'rooms.view',
    label: 'Lihat Ruang Kelas & Laboratorium',
    description: 'Melihat daftar ruang belajar, laboratorium, dan sarana institusi',
    module: 'Sarana Belajar',
  },
  {
    code: 'rooms.manage',
    label: 'Kelola Ruang & Fasilitas',
    description: 'Mengatur kapasitas, lokasi gedung, dan fasilitas ruang kelas',
    module: 'Sarana Belajar',
  },

  // 17. Kurikulum, Mapel, & Beban Mengajar (Phase 4)
  {
    code: 'curriculum.view',
    label: 'Lihat Kurikulum',
    description: 'Melihat struktur Kurikulum Merdeka, K13, atau OBE Kampus',
    module: 'Kurikulum',
  },
  {
    code: 'curriculum.manage',
    label: 'Kelola Kurikulum',
    description: 'Mengatur capaian pembelajaran, alokasi jam, dan struktur kurikulum',
    module: 'Kurikulum',
  },
  {
    code: 'subjects.view',
    label: 'Lihat Mata Pelajaran & Mata Kuliah',
    description: 'Melihat daftar mapel sekolah atau mata kuliah kampus',
    module: 'Mata Pelajaran',
  },
  {
    code: 'subjects.manage',
    label: 'Kelola Mata Pelajaran & Mata Kuliah',
    description: 'Menambah, mengubah bobot SKS / jam, dan kelompok mata pelajaran',
    module: 'Mata Pelajaran',
  },
  {
    code: 'teachingassignments.view',
    label: 'Lihat Pembagian Tugas Mengajar',
    description: 'Melihat daftar penugasan guru/dosen dan rekap beban mengajar',
    module: 'Penugasan Mengajar',
  },
  {
    code: 'teachingassignments.manage',
    label: 'Kelola Tugas Mengajar',
    description: 'Menetapkan guru/dosen pengampu mata pelajaran pada rombel/kelas',
    module: 'Penugasan Mengajar',
  },

  // 18. Jadwal Pelajaran & Deteksi Konflik (Phase 4)
  {
    code: 'schedules.view',
    label: 'Lihat Jadwal Pelajaran / Perkuliahan',
    description: 'Melihat jadwal harian, mingguan, per kelas, per guru, dan per ruangan',
    module: 'Jadwal',
  },
  {
    code: 'schedules.manage',
    label: 'Kelola Jadwal & Validasi Konflik',
    description: 'Menyusun jadwal bebas bentrok (guru ganda, kelas ganda, ruang ganda)',
    module: 'Jadwal',
  },

  // 19. Dokumen Pembelajaran (Silabus, RPP, Modul Ajar, RPS) (Phase 4)
  {
    code: 'learningdocs.view',
    label: 'Lihat Dokumen Pembelajaran',
    description: 'Melihat silabus, RPP, modul ajar, dan RPS mata pelajaran',
    module: 'Dokumen Pembelajaran',
  },
  {
    code: 'learningdocs.create',
    label: 'Buat Silabus, RPP, & Modul Ajar',
    description: 'Menyusun naskah capaian, tujuan pembelajaran, dan asesmen',
    module: 'Dokumen Pembelajaran',
  },
  {
    code: 'learningdocs.update',
    label: 'Ubah Dokumen Pembelajaran',
    description: 'Memperbarui materi ajar dan rancangan pembelajaran',
    module: 'Dokumen Pembelajaran',
  },
  {
    code: 'learningdocs.delete',
    label: 'Hapus Dokumen Pembelajaran',
    description: 'Menghapus draf modul ajar atau silabus',
    module: 'Dokumen Pembelajaran',
  },
  {
    code: 'learningdocs.approve',
    label: 'Supervisi & Verifikasi Modul Ajar',
    description: 'Memvalidasi dan menyetujui RPP / Modul Ajar / RPS oleh Kepala Sekolah/Kaprodi',
    module: 'Dokumen Pembelajaran',
  },

  // 20. Kalender Akademik Institusi (Phase 4)
  {
    code: 'academiccalendar.view',
    label: 'Lihat Kalender Akademik',
    description: 'Melihat agenda libur, ujian, penilaian, dan acara akademik',
    module: 'Kalender Akademik',
  },
  {
    code: 'academiccalendar.manage',
    label: 'Kelola Kalender Akademik',
    description: 'Menambah dan memperbarui agenda kalender akademik institusi',
    module: 'Kalender Akademik',
  },
];

export const FUTURE_MODULE_PERMISSIONS: { module: string; codes: string[] }[] = [
  {
    module: 'Akademik & Kurikulum',
    codes: ['schedule.view', 'schedule.manage', 'attendance.view', 'attendance.mark', 'grades.view', 'grades.input', 'grades.update', 'reports.view'],
  },
  {
    module: 'Sarana & Prasarana',
    codes: ['library.view', 'library.manage'],
  },
  {
    module: 'Keuangan & SPP',
    codes: ['finance.view', 'finance.manage'],
  },
  {
    module: 'Kesiswaan & PPDB',
    codes: ['ppdb.view', 'ppdb.manage'],
  },
];

/**
 * Matriks Hak Akses Default untuk 14 Role Institusi Pendidikan
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, PermissionCode[]> = {
  // 1. Super Admin: Segala hak akses tanpa batasan
  SUPER_ADMIN: SYSTEM_PERMISSIONS.map((p) => p.code),

  // 2. Admin Sekolah: Pengelola operasional harian sekolah
  ADMIN_SEKOLAH: [
    'dashboard.view',
    'users.view', 'users.create', 'users.update', 'users.import', 'users.export', 'users.reset_password',
    'roles.view',
    'permissions.view',
    'teachers.view', 'teachers.create', 'teachers.update',
    'students.view', 'students.create', 'students.update',
    'parents.view', 'parents.create', 'parents.update',
    'staff.view', 'staff.create', 'staff.update',
    'homeroom.view', 'homeroom.manage',
    'invitations.create', 'invitations.view',
    'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
    'pages.view', 'pages.create', 'pages.update', 'pages.delete',
    'announcements.manage', 'events.manage', 'gallery.manage',
    'categories.manage', 'tags.manage',
    'media.view', 'media.upload', 'media.delete',
    'menus.manage', 'comments.manage',
    'seo.manage', 'settings.view', 'settings.update',
    'audit.view',
    'schedule.view', 'schedule.manage',
    'attendance.view', 'grades.view', 'reports.view',
    'ppdb.view', 'ppdb.manage',
    // Phase 4 Academic & Multi-Tenant
    'tenants.view', 'institution.manage',
    'academicyears.view', 'academicyears.manage',
    'academicterms.view', 'academicterms.manage',
    'academicstructure.view', 'academicstructure.manage',
    'rooms.view', 'rooms.manage',
    'curriculum.view', 'curriculum.manage',
    'subjects.view', 'subjects.manage',
    'teachingassignments.view', 'teachingassignments.manage',
    'schedules.view', 'schedules.manage',
    'learningdocs.view', 'learningdocs.create', 'learningdocs.update', 'learningdocs.delete', 'learningdocs.approve',
    'academiccalendar.view', 'academiccalendar.manage',
  ],

  // Alias ADMIN -> ADMIN_SEKOLAH
  ADMIN: [
    'dashboard.view',
    'users.view', 'users.create', 'users.update', 'users.import', 'users.export', 'users.reset_password',
    'roles.view',
    'permissions.view',
    'teachers.view', 'teachers.create', 'teachers.update',
    'students.view', 'students.create', 'students.update',
    'parents.view', 'parents.create', 'parents.update',
    'staff.view', 'staff.create', 'staff.update',
    'homeroom.view', 'homeroom.manage',
    'invitations.create', 'invitations.view',
    'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
    'pages.view', 'pages.create', 'pages.update', 'pages.delete',
    'announcements.manage', 'events.manage', 'gallery.manage',
    'categories.manage', 'tags.manage',
    'media.view', 'media.upload', 'media.delete',
    'menus.manage', 'comments.manage',
    'seo.manage', 'settings.view', 'settings.update',
    'audit.view',
    'tenants.view', 'institution.manage',
    'academicyears.view', 'academicyears.manage',
    'academicterms.view', 'academicterms.manage',
    'academicstructure.view', 'academicstructure.manage',
    'rooms.view', 'rooms.manage',
    'curriculum.view', 'curriculum.manage',
    'subjects.view', 'subjects.manage',
    'teachingassignments.view', 'teachingassignments.manage',
    'schedules.view', 'schedules.manage',
    'learningdocs.view', 'learningdocs.create', 'learningdocs.update', 'learningdocs.delete', 'learningdocs.approve',
    'academiccalendar.view', 'academiccalendar.manage',
  ],

  // 3. Kepala Sekolah: Supervisi, Pengumuman Resmi, Laporan
  KEPALA_SEKOLAH: [
    'dashboard.view',
    'users.view',
    'teachers.view',
    'students.view',
    'parents.view',
    'staff.view',
    'homeroom.view',
    'posts.view', 'posts.publish',
    'pages.view',
    'announcements.manage',
    'events.manage',
    'gallery.manage',
    'media.view',
    'comments.manage',
    'settings.view',
    'audit.view',
    'reports.view',
    'grades.view',
    'attendance.view',
    'finance.view',
    'ppdb.view',
    // Phase 4 Academic
    'institution.manage',
    'academicyears.view',
    'academicterms.view',
    'academicstructure.view',
    'rooms.view',
    'curriculum.view', 'curriculum.manage',
    'subjects.view',
    'teachingassignments.view', 'teachingassignments.manage',
    'schedules.view',
    'learningdocs.view', 'learningdocs.approve',
    'academiccalendar.view', 'academiccalendar.manage',
  ],

  // 4. Wakil Kepala Sekolah (Kurikulum/Kesiswaan/Humas)
  WAKIL_KEPALA_SEKOLAH: [
    'dashboard.view',
    'users.view',
    'teachers.view',
    'students.view',
    'parents.view',
    'homeroom.view',
    'posts.view', 'posts.create', 'posts.update', 'posts.publish',
    'pages.view',
    'announcements.manage', 'events.manage', 'gallery.manage',
    'media.view', 'media.upload',
    'schedule.view', 'schedule.manage',
    'attendance.view', 'grades.view', 'reports.view',
    'ppdb.view', 'ppdb.manage',
    // Phase 4 Academic
    'academicyears.view', 'academicyears.manage',
    'academicterms.view', 'academicterms.manage',
    'academicstructure.view', 'academicstructure.manage',
    'rooms.view', 'rooms.manage',
    'curriculum.view', 'curriculum.manage',
    'subjects.view', 'subjects.manage',
    'teachingassignments.view', 'teachingassignments.manage',
    'schedules.view', 'schedules.manage',
    'learningdocs.view', 'learningdocs.create', 'learningdocs.update', 'learningdocs.approve',
    'academiccalendar.view', 'academiccalendar.manage',
  ],

  // 5. Admin Akademik
  ADMIN_AKADEMIK: [
    'dashboard.view',
    'teachers.view',
    'students.view', 'students.create', 'students.update',
    'homeroom.view', 'homeroom.manage',
    'schedule.view', 'schedule.manage',
    'grades.view', 'grades.update', 'reports.view',
    'attendance.view',
    'announcements.manage',
    'events.manage',
    // Phase 4 Academic
    'academicyears.view',
    'academicterms.view',
    'academicstructure.view', 'academicstructure.manage',
    'rooms.view', 'rooms.manage',
    'curriculum.view',
    'subjects.view', 'subjects.manage',
    'teachingassignments.view', 'teachingassignments.manage',
    'schedules.view', 'schedules.manage',
    'learningdocs.view',
    'academiccalendar.view', 'academiccalendar.manage',
  ],

  // 6. Admin Kesiswaan
  ADMIN_KESISWAAN: [
    'dashboard.view',
    'students.view', 'students.create', 'students.update',
    'parents.view', 'parents.create', 'parents.update',
    'attendance.view', 'attendance.mark',
    'announcements.manage', 'events.manage', 'gallery.manage',
    'ppdb.view', 'ppdb.manage',
    'academicstructure.view',
    'schedules.view',
    'academiccalendar.view',
  ],

  // 7. Guru: Mengajar, Menulis Warta/Materi, Nilai Mapel, Presensi
  GURU: [
    'dashboard.view',
    'teachers.view',
    'students.view',
    'posts.view', 'posts.create', 'posts.update',
    'announcements.manage', 'events.manage',
    'media.view', 'media.upload',
    'schedule.view',
    'attendance.view', 'attendance.mark',
    'grades.view', 'grades.input',
    // Phase 4 Academic
    'academicstructure.view',
    'rooms.view',
    'curriculum.view',
    'subjects.view',
    'teachingassignments.view',
    'schedules.view',
    'learningdocs.view', 'learningdocs.create', 'learningdocs.update',
    'academiccalendar.view',
  ],

  // 8. Wali Kelas: Supervisi rombel, komunikasi ortu, raport kelas
  WALI_KELAS: [
    'dashboard.view',
    'teachers.view',
    'students.view', 'students.update',
    'parents.view',
    'homeroom.view',
    'posts.view', 'posts.create', 'posts.update',
    'announcements.manage', 'events.manage',
    'media.view', 'media.upload',
    'schedule.view',
    'attendance.view', 'attendance.mark',
    'grades.view', 'grades.input', 'grades.update', 'reports.view',
    // Phase 4 Academic
    'academicstructure.view',
    'rooms.view',
    'curriculum.view',
    'subjects.view',
    'teachingassignments.view',
    'schedules.view',
    'learningdocs.view', 'learningdocs.create', 'learningdocs.update',
    'academiccalendar.view',
  ],

  // 9. Tenaga Administrasi (Tata Usaha)
  TENAGA_ADMINISTRASI: [
    'dashboard.view',
    'users.view', 'users.create', 'users.update',
    'teachers.view',
    'students.view', 'students.create', 'students.update',
    'parents.view', 'parents.create', 'parents.update',
    'staff.view',
    'announcements.manage', 'events.manage',
    'media.view', 'media.upload',
    'academicstructure.view',
    'schedules.view',
    'academiccalendar.view',
  ],

  // 10. Bendahara Sekolah
  BENDAHARA: [
    'dashboard.view',
    'students.view',
    'parents.view',
    'finance.view', 'finance.manage',
    'announcements.manage',
  ],

  // 11. Pustakawan
  PUSTAKAWAN: [
    'dashboard.view',
    'students.view',
    'teachers.view',
    'library.view', 'library.manage',
    'announcements.manage',
    'media.view', 'media.upload',
  ],

  // 12. Petugas Sarpras
  PETUGAS_SARPRAS: [
    'dashboard.view',
    'events.manage',
    'announcements.manage',
    'media.view', 'media.upload',
    'rooms.view', 'rooms.manage',
  ],

  // 13. Siswa: Pembelajaran Mandiri, Portofolio & Nilai Pribadi
  SISWA: [
    'posts.view',
    'schedule.view',
    'attendance.view',
    'grades.view',
    'reports.view',
    'library.view',
    'schedules.view',
    'academiccalendar.view',
    'subjects.view',
  ],

  // 14. Orang Tua / Wali Murid: Memantau Perkembangan Anak
  ORANG_TUA: [
    'posts.view',
    'attendance.view',
    'grades.view',
    'reports.view',
    'finance.view',
    'schedules.view',
    'academiccalendar.view',
  ],
};

/**
 * Mendapatkan daftar seluruh perizinan efektif dari seorang user.
 * Mendukung MULTI-ROLE: Gabungan (Union) dari seluruh role yang dimiliki user.
 */
export function getUserEffectivePermissions(
  user: User | null | undefined,
  customRolePermissions?: Record<RoleName, PermissionCode[]>
): PermissionCode[] {
  if (!user || !user.isActive || user.status === 'BLOCKED') {
    return [];
  }

  // Multi-role array: prioritaskan user.roles jika ada, atau fallback ke [user.role]
  const assignedRoles: RoleName[] = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : (user.role ? [user.role] : []);

  // Jika salah satu rolenya SUPER_ADMIN, kembalikan semua permission sistem
  if (assignedRoles.includes('SUPER_ADMIN')) {
    return SYSTEM_PERMISSIONS.map((p) => p.code);
  }

  const matrix = customRolePermissions || DEFAULT_ROLE_PERMISSIONS;
  const permissionsSet = new Set<PermissionCode>();

  for (const role of assignedRoles) {
    const rolePerms = matrix[role];
    if (Array.isArray(rolePerms)) {
      rolePerms.forEach((p) => permissionsSet.add(p));
    }
  }

  return Array.from(permissionsSet);
}

/**
 * Memeriksa apakah user memiliki permission tertentu (Mendukung Multi-Role)
 */
export function hasPermission(
  user: User | null | undefined,
  permission: PermissionCode,
  customRolePermissions?: Record<RoleName, PermissionCode[]>
): boolean {
  if (!user || !user.isActive || user.status === 'BLOCKED') return false;
  
  const assignedRoles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : (user.role ? [user.role] : []);

  if (assignedRoles.includes('SUPER_ADMIN')) return true;

  const effectivePermissions = getUserEffectivePermissions(user, customRolePermissions);
  return effectivePermissions.includes(permission);
}

/**
 * Memeriksa apakah user memiliki salah satu dari daftar permission
 */
export function hasAnyPermission(
  user: User | null | undefined,
  permissions: PermissionCode[],
  customRolePermissions?: Record<RoleName, PermissionCode[]>
): boolean {
  if (!user || !user.isActive || user.status === 'BLOCKED') return false;
  const assignedRoles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : (user.role ? [user.role] : []);

  if (assignedRoles.includes('SUPER_ADMIN')) return true;

  const effective = getUserEffectivePermissions(user, customRolePermissions);
  return permissions.some((perm) => effective.includes(perm));
}

/**
 * Memeriksa apakah route admin dapat diakses oleh user
 */
export function canAccessAdminRoute(
  user: User | null | undefined,
  targetView: string,
  customRolePermissions?: Record<RoleName, PermissionCode[]>
): boolean {
  if (!user || !user.isActive || user.status === 'BLOCKED') return false;

  const assignedRoles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : (user.role ? [user.role] : []);

  if (assignedRoles.includes('SUPER_ADMIN')) return true;

  switch (targetView) {
    case 'admin-dashboard':
      return hasPermission(user, 'dashboard.view', customRolePermissions);

    // Kelembagaan & Pengguna (Phase 3)
    case 'admin-users':
    case 'admin-user-detail':
      return hasPermission(user, 'users.view', customRolePermissions);
    case 'admin-user-create':
      return hasPermission(user, 'users.create', customRolePermissions);
    case 'admin-user-edit':
      return hasPermission(user, 'users.update', customRolePermissions);
    
    case 'admin-teachers':
      return hasPermission(user, 'teachers.view', customRolePermissions);
    
    case 'admin-students':
      return hasPermission(user, 'students.view', customRolePermissions);
    
    case 'admin-parents':
      return hasPermission(user, 'parents.view', customRolePermissions);
    
    case 'admin-staff':
      return hasPermission(user, 'staff.view', customRolePermissions);
    
    case 'admin-homeroom':
      return hasPermission(user, 'homeroom.view', customRolePermissions);

    case 'admin-invitations':
      return hasPermission(user, 'invitations.view', customRolePermissions);

    case 'admin-import-export':
      return hasAnyPermission(user, ['users.import', 'users.export'], customRolePermissions);

    case 'admin-activity-logs':
    case 'admin-audit':
      return hasPermission(user, 'audit.view', customRolePermissions);

    // Role & Permission
    case 'admin-roles':
    case 'admin-role-create':
      return hasPermission(user, 'roles.view', customRolePermissions);
    case 'admin-permissions':
      return hasPermission(user, 'permissions.view', customRolePermissions);

    // Konten
    case 'admin-posts':
    case 'admin-post-create':
    case 'admin-post-edit':
    case 'admin-news':
    case 'admin-news-create':
    case 'admin-news-edit':
      return hasPermission(user, 'posts.view', customRolePermissions);
    case 'admin-pages':
    case 'admin-page-create':
    case 'admin-page-edit':
      return hasPermission(user, 'pages.view', customRolePermissions);
    case 'admin-announcements':
      return hasPermission(user, 'announcements.manage', customRolePermissions);
    case 'admin-events':
      return hasPermission(user, 'events.manage', customRolePermissions);
    case 'admin-gallery':
      return hasPermission(user, 'gallery.manage', customRolePermissions);

    // Taksonomi & Media
    case 'admin-categories':
      return hasPermission(user, 'categories.manage', customRolePermissions);
    case 'admin-tags':
      return hasPermission(user, 'tags.manage', customRolePermissions);
    case 'admin-media':
      return hasPermission(user, 'media.view', customRolePermissions);
    case 'admin-menus':
      return hasPermission(user, 'menus.manage', customRolePermissions);
    case 'admin-comments':
      return hasPermission(user, 'comments.manage', customRolePermissions);

    // Sistem
    case 'admin-seo':
      return hasPermission(user, 'seo.manage', customRolePermissions);
    case 'admin-settings':
      return hasPermission(user, 'settings.view', customRolePermissions);

    // Multi-Tenant & Platform SaaS (Phase 4)
    case 'admin-tenants':
    case 'admin-tenant-create':
      return hasPermission(user, 'tenants.view', customRolePermissions);
    case 'admin-subscriptions':
      return hasPermission(user, 'subscriptions.manage', customRolePermissions);
    case 'admin-institution-profile':
      return hasPermission(user, 'institution.manage', customRolePermissions);

    // Akademik & Kurikulum (Phase 4)
    case 'admin-academic-dashboard':
      return hasPermission(user, 'dashboard.view', customRolePermissions);
    case 'admin-academic-years':
      return hasPermission(user, 'academicyears.view', customRolePermissions);
    case 'admin-academic-terms':
      return hasPermission(user, 'academicterms.view', customRolePermissions);
    case 'admin-academic-structure':
      return hasPermission(user, 'academicstructure.view', customRolePermissions);
    case 'admin-rooms':
      return hasPermission(user, 'rooms.view', customRolePermissions);
    case 'admin-subjects':
      return hasPermission(user, 'subjects.view', customRolePermissions);
    case 'admin-curriculum':
      return hasPermission(user, 'curriculum.view', customRolePermissions);
    case 'admin-teaching-assignments':
      return hasPermission(user, 'teachingassignments.view', customRolePermissions);
    case 'admin-schedules':
      return hasPermission(user, 'schedules.view', customRolePermissions);
    case 'admin-learning-docs':
      return hasPermission(user, 'learningdocs.view', customRolePermissions);
    case 'admin-academic-calendar':
      return hasPermission(user, 'academiccalendar.view', customRolePermissions);

    default:
      return true;
  }
}

// -----------------------------------------------------------------------------
// DATA PRIVACY RULES (Section P)
// -----------------------------------------------------------------------------

/**
 * Aturan Privasi Data Siswa:
 * - SUPER_ADMIN, ADMIN_SEKOLAH, KEPALA_SEKOLAH, ADMIN_KESISWAAN, WALI_KELAS: Dapat melihat data siswa sesuai tugas
 * - Guru: Dapat melihat siswa dalam konteks pengajaran
 * - Siswa: HANYA melihat data miliknya sendiri
 * - Orang Tua: HANYA melihat data anak yang terhubung dan memiliki izin (canViewAcademicData)
 */
export function canViewStudentData(
  currentUser: User | null | undefined,
  targetStudentUserId: string,
  options?: {
    studentClassId?: string;
    homeroomTeacherClassIds?: string[];
    userLinkedStudentUserIds?: string[];
  }
): boolean {
  if (!currentUser || !currentUser.isActive) return false;

  const roles = Array.isArray(currentUser.roles) && currentUser.roles.length > 0
    ? currentUser.roles
    : [currentUser.role];

  // Super Admin & Admin Sekolah & Kepala Sekolah dapat melihat seluruh siswa
  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN_SEKOLAH') || roles.includes('ADMIN') || roles.includes('KEPALA_SEKOLAH') || roles.includes('ADMIN_KESISWAAN') || roles.includes('ADMIN_AKADEMIK')) {
    return true;
  }

  // Jika pengguna adalah siswa itu sendiri
  if (currentUser.id === targetStudentUserId) {
    return true;
  }

  // Jika siswa lain mencoba melihat profil siswa ini: DITOLAK (Aturan Privasi P)
  if (roles.includes('SISWA') && currentUser.id !== targetStudentUserId) {
    return false;
  }

  // Jika pengguna adalah Orang Tua: HANYA jika anak terhubung
  if (roles.includes('ORANG_TUA')) {
    if (options?.userLinkedStudentUserIds && options.userLinkedStudentUserIds.includes(targetStudentUserId)) {
      return true;
    }
    return false;
  }

  // Jika pengguna adalah Wali Kelas: Cek apakah kelas siswa cocok dengan kelas binaannya
  if (roles.includes('WALI_KELAS')) {
    if (options?.studentClassId && options?.homeroomTeacherClassIds?.includes(options.studentClassId)) {
      return true;
    }
    // Jika sebagai guru mata pelajaran umum, tetap boleh lihat basic data
    return true;
  }

  // Guru umum
  if (roles.includes('GURU')) {
    return true;
  }

  return false;
}

// -----------------------------------------------------------------------------
// TENANT ISOLATION RULES (Phase 4 Multi-Tenant SaaS)
// -----------------------------------------------------------------------------

/**
 * Memeriksa apakah user memiliki hak akses ke tenant tertentu
 * - SUPER_ADMIN: Bisa mengakses semua tenant platform
 * - User biasa: Harus terdaftar dalam tenant yang bersangkutan (tenantId atau tenantMemberships)
 */
export function canAccessTenant(
  user: User | null | undefined,
  targetTenantId: string,
  userMemberships?: { tenantId: string; status: string }[]
): boolean {
  if (!user || user.status === 'INACTIVE' || user.isActive === false || (user.status as string) === 'BLOCKED') {
    return false;
  }

  const roles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : (user.role ? [user.role] : []);

  if (roles.includes('SUPER_ADMIN')) {
    return true;
  }

  // Cek direct tenantId pada user
  if (user.tenantId && user.tenantId === targetTenantId) {
    return true;
  }

  // Cek multi-tenantIds array jika ada
  if (Array.isArray(user.tenantIds) && user.tenantIds.includes(targetTenantId)) {
    return true;
  }

  // Cek memberships jika disediakan
  if (userMemberships && userMemberships.length > 0) {
    return userMemberships.some(
      (m) => m.tenantId === targetTenantId && m.status === 'ACTIVE'
    );
  }

  return false;
}

/**
 * Filter koleksi entitas berdasarkan active tenantId (Tenant Isolation Guard)
 * Jika targetTenantId tidak diatur atau user adalah SUPER_ADMIN, bisa menampilkan sesuai opsi
 */
export function filterByTenant<T extends { tenantId?: string }>(
  items: T[],
  activeTenantId?: string | null,
  isSuperAdmin = false
): T[] {
  if (isSuperAdmin) {
    return items;
  }

  if (!activeTenantId) {
    return items;
  }

  return items.filter((item) => item.tenantId === activeTenantId);
}
