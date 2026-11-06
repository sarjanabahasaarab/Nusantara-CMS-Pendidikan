# Dokumentasi Role-Based Access Control (RBAC) — Nusantara Education CMS

Dokumen ini mendeskripsikan model otorisasi, hierarki peran, matriks hak akses, dan mekanisme evaluasi multi-peran pada **Nusantara Education CMS** (Phase 3).

---

## 1. 14 Peran Standar Pendidikan (Default Roles)

Sistem telah dilengkapi dengan 14 role bawaan yang mencerminkan struktur kelembagaan pendidikan di Indonesia (SD, SMP, SMA, SMK, dan Perguruan Tinggi):

| Kode Role | Nama Peran | Cakupan Wewenang Utama | Perlindungan Sistem |
|:---|:---|:---|:---:|
| `SUPER_ADMIN` | Super Administrator | Akses penuh seluruh modul, keamanan, dan pengaturan master | **Protected** (Tidak dapat dihapus / diblokir) |
| `ADMIN_SEKOLAH` | Administrator CMS Sekolah | Manajemen konten, pengguna, taksonomi, dan konfigurasi situs | **Protected** |
| `KEPALA_SEKOLAH` | Kepala Sekolah | Supervisi kinerja akademik, persetujuan warta, monitoring | **Protected** |
| `WAKIL_KEPALA_SEKOLAH` | Wakil Kepala Sekolah | Bidang kurikulum / sarpras / kesiswaan | **Protected** |
| `ADMIN_AKADEMIK` | Admin Akademik | Jadwal pelajaran, rombel, nilai raport, penugasan wali kelas | **Protected** |
| `ADMIN_KESISWAAN` | Admin Kesiswaan | Data peserta didik, mutasi, kedisiplinan, PPDB | **Protected** |
| `GURU` | Tenaga Pendidik / Guru | Bahan ajar, materi edukasi, evaluasi nilai mapel, presensi | **Protected** |
| `WALI_KELAS` | Wali Kelas | Supervisi rombel binaan, koordinasi orang tua, cetak raport | **Protected** |
| `TENAGA_ADMINISTRASI`| Tata Usaha (TU) | Buku induk, mutasi kesiswaan, kepegawaian, persuratan | **Protected** |
| `BENDAHARA` | Bendahara Sekolah | Pos keuangan, SPP, administrasi dana BOS, kas sekolah | **Protected** |
| `PUSTAKAWAN` | Pustakawan | Sirkulasi buku, pustaka digital, peminjaman literatur | **Protected** |
| `PETUGAS_SARPRAS` | Petugas Sarana & Prasarana | Inventaris gedung, laboratorium, pemeliharaan aset | **Protected** |
| `SISWA` | Peserta Didik | Akses portal mandiri (biodata, nilai, presensi milik sendiri) | **Protected** |
| `ORANG_TUA` | Orang Tua / Wali Murid | Akses portal wali (hanya memantau anak kandung terhubung) | **Protected** |

---

## 2. Mekanisme Multi-Role & Union Permission Evaluation

Dalam realitas sekolah di Indonesia, staf pengajar sering memegang tanggung jawab ganda, misalnya:
- **Pak Ahmad Fauzi**: `GURU` (Fisika) merangkap `WALI_KELAS` (Kelas X-A).
- **Ibu Ratna Juwita**: `KEPALA_SEKOLAH` merangkap `GURU`.

### Prinsip Evaluasi (Union Permisif):
1. Pengguna memiliki atribut `roles: RoleName[]`.
2. Izin efektif pengguna dihitung melalui penggabungan himpunan (*set union*) dari seluruh role yang dimilikinya:
   $$\text{EffectivePermissions}(U) = \bigcup_{R \in U.\text{roles}} \text{Permissions}(R)$$
3. Jika salah satu dari role pengguna adalah `SUPER_ADMIN`, maka seluruh permission di dalam sistem otomatis diberikan (*bypass total*).
4. Tidak ada konflik negatif antar role (prinsip aditif aman).

---

## 3. Matriks Permission Granular per Modul

Izin akses dibagi ke dalam modul-modul independen:

### A. Pengguna & Keamanan
- `users.view`: Melihat daftar pengguna
- `users.create`: Menambah pengguna baru
- `users.update`: Mengubah profil dan data pengguna
- `users.delete`: Menghapus pengguna (kecuali `SUPER_ADMIN`)
- `users.block`: Memblokir / membuka blokir akun
- `users.reset_password`: Menerbitkan reset password
- `users.import`: Batch import data CSV
- `users.export`: Ekspor data CSV terfilter
- `roles.view`, `roles.create`, `roles.update`, `roles.delete`: Manajemen role kustom
- `permissions.view`, `permissions.manage`: Pengaturan matriks izin
- `invitations.create`, `invitations.view`: Manajemen token undangan akun

### B. Domain Pendidik & Kelembagaan
- `teachers.view`, `teachers.create`, `teachers.update`, `teachers.delete`: Profil guru & NIP
- `students.view`, `students.create`, `students.update`, `students.delete`: Buku induk siswa & NIS
- `parents.view`, `parents.create`, `parents.update`, `parents.delete`: Data orang tua & relasi wali
- `staff.view`, `staff.create`, `staff.update`, `staff.delete`: Tenaga kependidikan
- `homeroom.view`, `homeroom.manage`: Penugasan wali kelas

### C. Konten Publikasi CMS
- `posts.view`, `posts.create`, `posts.update`, `posts.delete`, `posts.publish`: Artikel & warta berita
- `pages.view`, `pages.create`, `pages.update`, `pages.delete`: Halaman statis sekolah
- `announcements.manage`: Pengumuman resmi
- `events.manage`: Agenda & kalender akademik
- `gallery.manage`: Album dokumentasi foto
- `categories.manage`, `tags.manage`: Taksonomi berjenjang
- `media.view`, `media.upload`, `media.delete`: Pustaka berkas digital
- `menus.manage`: Desain navigasi website
- `comments.manage`: Moderasi komentar publik

### D. Sistem, Audit & Fondasi Akademik
- `seo.manage`: Meta tag, OG card, sitemap
- `settings.view`, `settings.update`: Identitas sekolah, NPSN, akreditasi
- `audit.view`: Jejak audit keamanan sistem
- `attendance.view`, `attendance.mark`: Rekap presensi
- `grades.view`, `grades.input`, `grades.update`, `reports.view`: Raport & evaluasi

---

## 4. Perlindungan Role Kustom

1. **Role Sistem Bawaan**: Dilarang dihapus untuk menjaga stabilitas arsitektur aplikasi (`isSystem: true`).
2. **In-Use Role Protection**: Jika role kustom sedang digunakan oleh minimal satu pengguna aktif, sistem menolak penghapusan dan memberikan peringatan untuk mengalihkan role pengguna terlebih dahulu.
