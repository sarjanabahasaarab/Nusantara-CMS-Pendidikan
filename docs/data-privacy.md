# Kebijakan & Arsitektur Privasi Data Pendidikan — Nusantara Education CMS

Dokumen ini memaparkan prinsip perlindungan data pribadi siswa, guru, dan orang tua murid sesuai standar UU Perlindungan Data Pribadi (UU PDP) dan etika privasi institusi pendidikan pada **Nusantara Education CMS** (Phase 3).

---

## 1. Prinsip Perlindungan Data Pribadi Siswa

Peserta didik di bawah umur memiliki hak privasi yang dilindungi secara hukum. Sistem mengimplementasikan fungsi gerbang privasi `canViewStudentData(currentUser, targetStudentUserId, context)` dengan batasan berikut:

### Matriks Akses Data Profil & Akademik Siswa:

| Identitas Peminta | Siswa Sendiri | Siswa Lain | Anak Sendiri (Ortu) | Anak Lain (Ortu) | Guru Pengajar | Wali Kelas Rombel | Admin / Kepsek |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Biodata Pribadi** | **DIIZINKAN** | **DITOLAK** | **DIIZINKAN** | **DITOLAK** | Terbatas | Penuh | Penuh |
| **Nilai Raport & Tugas** | **DIIZINKAN** | **DITOLAK** | **DIIZINKAN*** | **DITOLAK** | Mapel Ybs | Rombel Binaan | Penuh |
| **Catatan BK / Disiplin**| Terbatas | **DITOLAK** | Konsultatif | **DITOLAK** | Terbatas | **DIIZINKAN** | Penuh |

*\*Catatan*: Akses orang tua ke nilai anak memerlukan flag `canViewAcademicData: true` pada relasi `StudentParent`.

---

## 2. Isolasi Portal Peserta Didik (Siswa)

1. Siswa yang login ke portal **HANYA** dapat mengakses profil, rekap presensi, dan capaian belajar miliknya sendiri (`currentUser.id === targetStudentUserId`).
2. Permintaan API atau tampilan antarmuka yang mencoba memuat biodata atau rekapitulasi nilai peserta didik lain akan dicegat dengan status `403 Forbidden` atau ditolak oleh validasi lapis domain.
3. Ranking kelas dan perbandingan nilai antar siswa hanya ditampilkan dalam bentuk statistik anonim (seperti rata-rata kelas) tanpa mengekspos identitas pribadi siswa lain.

---

## 3. Isolasi Portal Orang Tua / Wali

1. Orang tua **HANYA** dapat melihat data anak-anak yang telah diverifikasi dan dihubungkan secara sah di dalam tabel `StudentParent`.
2. Jika seorang ibu memiliki 2 anak (misalnya Rizky di kelas X dan Zahra di kelas XI), portal akan menyediakan pemilih (*selector*) anak yang sah.
3. Orang tua sama sekali tidak memiliki akses terhadap informasi siswa lain maupun orang tua lain di dalam rombel atau sekolah.

---

## 4. Perlindungan Data Kepegawaian Pendidik

1. Informasi sensitif guru seperti **NIK**, **nomor rekening bank**, dan **riwayat penyakit/catatan internal kepegawaian** hanya dapat diakses oleh Kepala Sekolah, Admin Sekolah, dan Tenaga Administrasi (TU Kepegawaian).
2. Direktori guru publik di website sekolah hanya menampilkan informasi profesional: Nama Lengkap, Gelar, Mata Pelajaran yang Diampu, dan foto profil.

---

## 5. Keamanan Ekspor Data & Sanitasi Berkas (Anti-Kebocoran)

Fungsi ekspor data institusi (**Batch CSV Export**) menerapkan sanitasi ketat:
- Seluruh kolom `passwordHash` otomatis dibuang (*stripped*).
- Token reset kata sandi (`token`, `expiresAt`) dan token sesi tidak disertakan.
- Informasi lockout keamanan (`lockedUntil`, `failedLoginAttempts`) tidak diekspos.
- Hasil ekspor disimpan dalam format CSV standar yang aman tanpa mengeksekusi rumus formula berbahaya (*CSV Formula Injection Prevention*).

---

## 6. Jejak Audit & Akuntabilitas (Audit Trail)

Setiap tindakan yang menyangkut perubahan profil, pengubahan role pengguna, pemblokiran akun, dan ekspor data secara massal dicatat dalam `AuditLog` dengan informasi:
- ID & Nama Pengguna Pelaksana
- Role Pengguna Pelaksana
- Aksi (`USER_CREATE`, `USER_BLOCK`, `ROLE_UPDATE`, `CSV_EXPORT`, dsb.)
- Entitas Target & ID Entitas
- Timestamp presisi tinggi
- Rincian deskriptif perubahan data
