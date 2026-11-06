# 🎓 Nusantara Education CMS (Phase 4 — Multi-Tenant SaaS & Academic Curriculum)

> **Sistem Manajemen Konten (CMS) dan Platform Pendidikan SaaS Multi-Tenant Terpadu Terbuka (Open-Source)**  
> Dirancang untuk SD, SMP, SMA, SMK, dan Perguruan Tinggi (Universitas, Politeknik, Akademi) di seluruh Indonesia.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Vitest-52%20Passed-449C44?logo=vitest)](https://vitest.dev/)

---

## 📖 1. Deskripsi Proyek

**Nusantara Education CMS** adalah platform web open-source enterprise-grade yang dikembangkan untuk menjawab kebutuhan digitalisasi institusi pendidikan di Indonesia. Platform ini bertransformasi menjadi **Multi-Tenant SaaS Platform** yang mampu melayani ribuan sekolah dan kampus dengan isolasi data yang aman, identitas mandiri, serta manajemen akademik dan kurikulum profesional.

### 🚀 Pencapaian Phase 4 (Multi-Tenant SaaS & Academic Curriculum):
1. **Arsitektur Multi-Tenant SaaS:**
   - Model database komprehensif: `Tenant`, `TenantDomain`, `TenantMembership`, `TenantSetting`, `TenantSubscription`, `TenantUsage`.
   - Isolasi data ketat (*strict tenant partitioning*): query database, store, dan API terlindungi otomatis.
   - Pendaftaran institusi mandiri (*self-service onboarding*) dengan verifikasi subdomain unik dan setup instan.
2. **Paket Langganan & Kuota SaaS (Freemium Model):**
   - 4 Tingkatan paket: `FREE`, `BASIC`, `PROFESSIONAL`, dan `ENTERPRISE`.
   - Pelacak kuota riil: jumlah pengguna aktif, siswa terdaftar, kapasitas penyimpanan berkas, dan fitur premium.
3. **Pusat Komando Akademik & Kurikulum:**
   - Manajemen Tahun Ajaran dan Semester dengan aturan tunggal-aktif (*Single-Active Rule*).
   - Hierarki pendidikan adaptif: Fakultas, Departemen/Jurusan, Program Studi, Jenjang Tingkat (Grade Level), dan Rombongan Belajar (Rombel).
   - Sarana & Prasarana Belajar: Pengelolaan ruang kelas teori, lab komputer & AI, lab sains, bengkel vokasi, dan auditorium.
   - Manajemen Mata Pelajaran & Kursus dengan beban kredit (SKS / Jam Pelajaran) serta Kriteria Ketuntasan Minimal (KKM).
4. **Kurikulum Merdeka & OBE Kampus:**
   - Pemetaan Capaian Pembelajaran (CP / CPL) dan Tujuan Pembelajaran (TP / CPMK).
   - Alur persetujuan perangkat ajar 4-tahap (Draft, Submitted, Approved, Revision dengan catatan supervisor).
5. **Engine Penjadwalan Anti-Bentrok 3-Dimensi:**
   - Deteksi bentrok jadwal waktu nyata: Guru, Rombel/Kelas, dan Ruang Belajar.
   - Tampilan visual kisi mingguan (*Weekly Timetable Grid*), daftar harian, dan tata letak cetak (*Print/PDF ready*).
6. **Beban Kerja Pendidik (24 Jam Standar Nasional):**
   - Distribusi mengajar terukur dengan persentase pemenuhan syarat sertifikasi pendidik nasional.
7. **Kalender Akademik Institusi:**
   - Agenda kegiatan terpadu (MPLS, asesmen sumatif, libur semester, upacara, wisuda, PPDB).
8. **Dokumentasi Lengkap:**
   - [Arsitektur Multi-Tenant SaaS](docs/multi-tenant-architecture.md)
   - [Sistem Akademik Terpadu](docs/academic-system.md)
   - [Manajemen Kurikulum & Capaian (CP/TP)](docs/curriculum-management.md)
   - [Engine Penjadwalan & Anti-Bentrok 3-Arah](docs/academic-scheduling.md)
   - [Keamanan Multi-Tenant & Kebijakan Data](docs/tenant-security.md)
   - [Panduan Migrasi Database Phase 4](docs/database-migration-phase-4.md)
   - [Panduan Deployment Vercel](docs/vercel-deployment.md)

---

## 👥 2. Akun Demo Bawaan Seluruh Peran Pendidikan

Gunakan email berikut untuk menguji hak akses spesifik (Password default: `AdminNusantara123!` untuk Super Admin, atau `Password123!` untuk staf/pengguna lainnya):

| Peran (Role) | Email | Nama Pengguna | Catatan / Keistimewaan |
|---|---|---|---|
| **Super Admin** | `admin@example.com` | Dr. H. Bambang Sudirman, M.Ed | Akses penuh master; dilindungi anti-hapus |
| **Admin Sekolah** | `cms.admin@nusantara.sch.id` | Rian Pratama, S.Kom | Kelola konten & data pengguna |
| **Kepala Sekolah** | `kepsek@nusantara.sch.id` | Dra. Hj. Ratna Juwita, M.Pd | Supervisi sekolah & warta resmi |
| **Wakil Kepala Sekolah**| `wakasek@nusantara.sch.id` | Drs. H. Suryono, M.Si | Merangkap Guru Fisika |
| **Guru & Wali Kelas** | `guru@nusantara.sch.id` | Ahmad Fauzi, S.Pd | **Multi-Role**: Guru Matematika & Wali Kelas X-A |
| **Guru Biologi** | `siti.rahma@nusantara.sch.id` | Siti Rahmawati, M.Pd | Wali Kelas X-B |
| **Tata Usaha (TU)** | `tu@nusantara.sch.id` | Dewi Lestari, A.Md | Input buku induk, siswa, surat |
| **Bendahara** | `bendahara@nusantara.sch.id` | Ratna Sari, S.E | Administrasi keuangan & SPP |
| **Pustakawan** | `perpustakaan@nusantara.sch.id`| Bambang Hidayat, S.IP | Katalog buku & sirkulasi |
| **Petugas Sarpras**| `sarpras@nusantara.sch.id` | Joko Prasetyo | Inventaris sarana prasarana |
| **Peserta Didik (Siswa)**| `siswa@nusantara.sch.id` | Muhammad Rizky Pratama | Kelas X-A (Portal pribadi terlindungi) |
| **Orang Tua / Wali** | `orangtua@nusantara.sch.id` | Ibu Hj. Kartika Dewi, S.E | Orang tua dari Rizky & Zahra |

*(Tips: Gunakan pemilih peran di sudut kanan atas TopBar Admin untuk beralih peran instan saat menguji antarmuka)*

---

## 🗺️ 3. Peta Jalan Pengembangan (*Roadmap*)

- [x] **Phase 1 (Selesai):** Fondasi Arsitektur, Website Publik, CMS Berita & Halaman, Media Library, RBAC 6 Role, Audit Log, Docker, dan SEO.
- [x] **Phase 2 (Selesai):** CMS Konten Lengkap: Artikel & Berita terpadu, Kategori Berjenjang, Tag Many-to-Many, Status Konten (Draf, Terjadwal, Tayang, Sampah), Aksi Massal, Menu Builder Interaktif, Moderasi Komentar, Album Galeri & Lightbox, Agenda Detail, Pencarian Terpadu, dan Panduan Vercel.
- [x] **Phase 3 (Selesai):** Advanced User Management & RBAC: 14 Role Pendidikan Bawaan, Multi-Role Union Evaluation, Profil Guru/NIP, Buku Induk Siswa/NIS, Relasi M:N Orang Tua-Siswa, Penugasan Wali Kelas 1-Active-Constraint, Tenaga Kependidikan TU/Bendahara/Perpustakaan/Sarpras, Undangan Akun 7-Hari, Reset Password Sekali-Pakai, Proteksi Brute-Force 5x Salah, Batch CSV Import/Export, dan Kebijakan Privasi Data Siswa.
- [ ] **Phase 4:** Akademik & Raport Kurikulum Merdeka (KBM, Rombel, Jadwal Pelajaran, Presensi Kelas, Penilaian Sumatif/Formatif, dan Buku Raport).
- [ ] **Phase 5:** Kesiswaan & Kedisiplinan (Poin Prestasi, Pelanggaran, Konseling BK, dan Ekstrakurikuler).
- [ ] **Phase 6:** PPDB Online (Penerimaan Peserta Didik Baru Terpadu, Verifikasi Berkas, dan Seleksi Jalur Zonasi/Prestasi).
- [ ] **Phase 7:** Keuangan Sekolah & Pembayaran SPP Online (Payment Gateway, Virtual Account, Rekap Tunggakan).
- [ ] **Phase 8:** Perpustakaan Digital Terpadu (*E-Library* Barcode & Peminjaman Mandiri).
- [ ] **Phase 9:** Sarana & Prasarana (Inventaris Ruang, Pemeliharaan Aset, Peminjaman Fasilitas).
- [ ] **Phase 10:** Tata Usaha & Persuratan Elektronik (Disposisi Surat Masuk/Keluar, Tanda Tangan Digital).
- [ ] **Phase 4:** Kesiswaan, Portal Siswa, Absensi Digital QR-Code, dan Poin Pelanggaran & Prestasi.
- [ ] **Phase 5:** Penilaian Guru, E-Raport Kurikulum Merdeka, dan Cetak Lembar Hasil Belajar.
- [ ] **Phase 6:** PPDB Online (Penerimaan Peserta Didik Baru), Verifikasi Berkas, dan Seleksi Jalur Prestasi/Zonasi.
- [ ] **Phase 7:** Portal Orang Tua / Wali Murid & Notifikasi Kehadiran.
- [ ] **Phase 8:** Modul Keuangan Sekolah, Tagihan SPP Terintegrasi Payment Gateway, dan Bukti Pembayaran Digital.
- [ ] **Phase 9:** Perpustakaan Digital (*E-Library*), Peminjaman Buku Barcode, dan E-Book Interaktif.
- [ ] **Phase 10:** Tata Usaha, Administrasi Surat Masuk/Keluar Elektronik, Tanda Tangan Digital Kepala Sekolah.

---

## 📄 7. Lisensi

Proyek ini dirilis di bawah lisensi terbuka [MIT License](LICENSE). Bebas digunakan dan dimodifikasi untuk seluruh sekolah di Indonesia.
