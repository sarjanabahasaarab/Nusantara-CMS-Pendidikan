# Dokumentasi Manajemen Pengguna — Nusantara Education CMS

Dokumen ini menjelaskan arsitektur, siklus hidup, dan spesifikasi teknis manajemen pengguna dan profil pendidikan pada **Nusantara Education CMS** (Phase 3).

---

## 1. Arsitektur Akun & Profil Pendidikan

Nusantara Education CMS memisahkan data akun autentikasi inti (`User`) dengan data domain kelembagaan pendidikan (`TeacherProfile`, `StudentProfile`, `ParentProfile`, `StaffProfile`). Pemisahan ini memastikan:
1. Akun login bersifat terisolasi dan aman dengan kredensial hash yang kuat.
2. Setiap entitas pendidikan memiliki atribut spesifik sesuai standar Dapodik / Kemendikbudristek.
3. Mendukung multi-peran (misalnya seorang Guru yang sekaligus menjadi Wali Kelas, atau Kepala Sekolah yang merangkap Guru mata pelajaran).

```
                      ┌───────────────┐
                      │     User      │
                      │  (Akun Utama) │
                      └───────┬───────┘
          ┌───────────────────┼───────────────────┐
          │                   │                   │
  ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
  │TeacherProfile │   │StudentProfile │   │ ParentProfile │
  │(NIP/NUPTK/PTK)│   │  (NIS/NISN)   │   │  (Pekerjaan)  │
  └───────┬───────┘   └───────▲───────┘   └───────┬───────┘
          │                   │                   │
          ▼                   └─────────┬─────────┘
  ┌───────────────┐                     │
  │HomeroomAssign │                     ▼
  │ (Wali Kelas)  │             ┌───────────────┐
  └───────────────┘             │ StudentParent │
                                │ (Hubungan M:N)│
                                └───────────────┘
```

---

## 2. Model Profil Kelembagaan

### A. Pendidik & Guru (`TeacherProfile`)
- **Atribut**: NIP, NUPTK, Nama Lengkap, Gelar, Tempat/Tanggal Lahir, Jenis Kelamin, Alamat, Nomor HP, Pendidikan Terakhir, Program Studi, Status Kepegawaian (`PNS`, `PPPK`, `HONORER`, `GTT`, `GTY`), Tanggal Mulai Bertugas, Catatan Kepegawaian.
- **Relasi**:
  - Terhubung ke `User` (1-to-1).
  - Terhubung ke mata pelajaran yang diajarkan.
  - Dapat ditugaskan sebagai Wali Kelas pada satu atau lebih rombongan belajar lintas tahun ajaran.

### B. Peserta Didik / Siswa (`StudentProfile`)
- **Atribut**: NIS (Nomor Induk Siswa - Unik), NISN (Nomor Induk Siswa Nasional), Nama Lengkap, Kelas / Rombel, Tempat/Tanggal Lahir, Jenis Kelamin, Alamat Domisili, Nomor Telepon, Status Siswa (`AKTIF`, `LULUS`, `MUTASI`, `DROPOUT`, `NONAKTIF`).
- **Integritas Data (Soft Delete / Archive)**:
  - Penghapusan data profil siswa tidak menghancurkan rekam jejak akademik, melainkan mengarsipkan status menjadi `NONAKTIF` agar riwayat nilai raport, presensi, dan ijazah tetap terjaga utuh.

### C. Orang Tua / Wali (`ParentProfile` & `StudentParent`)
- **Atribut**: Nama Lengkap, NIK, Pekerjaan, Instansi Kerja, Alamat Rumah, Nomor Telepon / WhatsApp Darurat.
- **Relasi Many-to-Many (`StudentParent`)**:
  - Satu orang tua dapat memiliki lebih dari satu anak bersekolah di institusi yang sama (misal kakak di kelas XII, adik di kelas X).
  - Satu siswa dapat terhubung ke Ayah, Ibu, dan Wali secara bersamaan.
  - Setiap relasi dilengkapi flag izin privasi: `isPrimaryContact` dan `canViewAcademicData`.

### D. Tenaga Kependidikan & Tata Usaha (`StaffProfile`)
- **Atribut**: Nomor Pegawai, Unit Kerja (`Tata Usaha`, `Keuangan/Bendahara`, `Perpustakaan`, `Sarana & Prasarana`, `Laboratorium`, `Keamanan`), Jabatan, Status Kepegawaian, Tanggal Mulai Bekerja.

---

## 3. Penugasan Wali Kelas & Rombel (`HomeroomAssignment`)

### Aturan Bisnis Wajib:
1. **Single Active Teacher Constraint**: Pada satu rombel/kelas di tahun ajaran yang sama, hanya diperbolehkan tepat **1 wali kelas yang aktif**.
2. Sistem secara otomatis menolak penugasan kedua jika status wali kelas sebelumnya masih bertanda aktif.
3. Untuk mengganti wali kelas, penugasan sebelumnya harus dinonaktifkan (`isActive: false` dengan `endDate`), lalu penugasan baru diterbitkan.

---

## 4. Keamanan Akun & Perlindungan Brute-Force

1. **Password Hashing**: Menggunakan bcrypt / PBKDF2 salt 10 rounds; password plaintext tidak pernah disimpan di database atau diekspos dalam API response.
2. **Brute-Force Rate Limiting**:
   - Jika pengguna salah memasukkan password sebanyak **5 kali berturut-turut**, akun akan terkunci sementara selama 30 detik (mode simulasi/development) atau 15 menit (mode produksi).
   - Setiap percobaan login (berhasil maupun gagal) dicatat dalam tabel `LoginHistory` mencakup IP address, User-Agent, dan timestamp.
3. **Perlindungan SUPER_ADMIN**:
   - Akun `SUPER_ADMIN` tidak dapat dihapus atau diblokir oleh siapa pun (termasuk sesama admin) untuk mencegah situasi terkunci permanen (*lockout*).
4. **Undangan Akun (Single-Use Invitation Token)**:
   - Admin dapat mengundang guru, staf, atau siswa baru menggunakan alamat email.
   - Sistem menerbitkan token kriptografis acak dengan masa berlaku **7 hari**.
   - Pengguna mengklik tautan aktivasi, menentukan kata sandi baru, dan status akun berubah dari `PENDING_INVITE` menjadi `ACTIVE`. Token hangus seketika setelah digunakan.
5. **One-Time Password Reset Token**:
   - Permintaan reset kata sandi menerbitkan token acak 64-karakter dengan masa berlaku **1 jam**.
   - Setelah kata sandi diperbarui, token ditandai `isUsed: true` dan tidak dapat dipakai ulang.

---

## 5. Batch CSV Import & Export Data

Menu **/admin/import-export** menyediakan fasilitas import dan export data secara massal dalam format CSV standar RFC 4180:

### Format Kolom Import Guru:
`Nama,Email,Nomor HP,NIP,Mapel,Status Kepegawaian`

### Format Kolom Import Siswa:
`Nama Lengkap,NIS,NISN,Kelas,Email,Nomor HP`

### Format Kolom Import Orang Tua:
`Nama Lengkap,Email,Nomor HP,Pekerjaan,Alamat`

### Format Kolom Import Staf:
`Nama Lengkap,Email,Nomor Pegawai,Unit Kerja,Jabatan,Nomor HP`

### Penanganan Galat & Validasi:
- Validasi email unik: Jika email sudah terdaftar, baris terkait ditandai gagal dan nomor baris dilaporkan pada tabel laporan import.
- Validasi NIS unik: Mencegah penomoran ganda pada buku induk siswa.
- Sanitasi Data Ekspor: Ekspor data pengguna menjamin kolom sensitif (`passwordHash`, `lockedUntil`, `token`) dihilangkan secara otomatis.
