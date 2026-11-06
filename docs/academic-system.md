# Sistem Akademik Terintegrasi — Nusantara Education CMS

## 1. Ikhtisar Sistem Akademik

Sistem Akademik Nusantara Education CMS Phase 4 dirancang secara modular dan fleksibel untuk mendukung seluruh jenjang pendidikan nasional di Indonesia:
- **Pendidikan Dasar & Menengah (K-12):** SD/MI, SMP/MTs, SMA/MA, dan SMK/MAK.
- **Pendidikan Tinggi:** Universitas, Politeknik, Institut, Sekolah Tinggi, dan Akademi.

Sistem menghubungkan kalender tahun ajaran, semester, hierarki kelembagaan (fakultas, jurusan, prodi, jenjang tingkat), manajemen sarana prasarana belajar (ruang teori, lab komputer, lab sains, bengkel vokasi), katalog mata pelajaran dengan sistem beban belajar (SKS untuk kampus, Jam Pelajaran/JP untuk sekolah), serta penugasan guru/dosen dengan pemantauan standar 24 jam tatap muka nasional.

---

## 2. Struktur Hierarki Akademik

```
[ Tenant / Institusi ]
      │
      ├── [ Tahun Ajaran (AcademicYear) ] ── [ Semester (AcademicTerm) ]
      │
      ├── [ Fakultas / Unit Akademik ] (Perguruan Tinggi)
      │         │
      │         └── [ Jurusan / Departemen ]
      │                   │
      │                   └── [ Program Studi (StudyProgram) ]
      │
      ├── [ Tingkat / GradeLevel ] (X, XI, XII atau Semester 1-8)
      │
      ├── [ Rombongan Belajar (AcademicClass) ]
      │         ├── Wali Kelas / Dosen Pembimbing Akademik
      │         ├── Ruang Kelas Home-Base
      │         └── Kapasitas Maksimal & Siswa Terdaftar
      │
      └── [ Sarana & Ruang Belajar (Room) ]
                ├── Gedung & Lantai
                ├── Tipe (Teori, Lab Komputer, Lab Fisika, Bengkel)
                └── Fasilitas & Status Ketersediaan
```

---

## 3. Manajemen Tahun Ajaran & Semester

1. **Aturan Single-Active (Single-Active Rule):**
   Pada setiap tenant, hanya boleh ada **satu tahun ajaran yang berstatus `ACTIVE`** dan **satu semester yang berstatus `ACTIVE`** dalam satu waktu.
   Ketika administrator mengaktifkan tahun ajaran atau semester baru, sistem secara atomik menonaktifkan periode sebelumnya dan mencatat jejak audit perubahannya.

2. **Siklus Hidup Periode Akademik:**
   - `DRAFT`: Periode baru sedang disiapkan kurikulum dan distribusinya.
   - `ACTIVE`: Periode operasional berjalan aktif (pembelajaran, presensi, penilaian).
   - `CLOSED`: Periode telah berakhir, raport telah dicetak dan data diarsipkan (*read-only*).

---

## 4. Mata Pelajaran, Kursus & Beban SKS/JP

Setiap mata pelajaran dikelola dengan parameter kurikuler lengkap:
- **Kode Unik:** Misal `MAT-10`, `INF-10`, `D4RPL-301`.
- **Nama Mata Pelajaran / Kursus:** Format baku dinas atau program studi.
- **Kategori:** Wajib Nasional, Muatan Lokal, Peminatan MIPA/IPS, Vokasi/Keahlian, Pilihan Merdeka.
- **Beban Belajar:**
  - Satuan Kredit Semester (SKS) untuk perguruan tinggi (1-4 SKS).
  - Jam Pelajaran (JP) untuk K-12 (2-6 JP @ 45 menit).
- **Kriteria Ketuntasan Minimal (KKM) / Passing Grade:** Standar nilai batas kelulusan (0-100), misal 75.0.

---

## 5. Distribusi Penugasan Pendidik & Standar 24 Jam

Kemendikbudristek menetapkan beban kerja guru bersertifikasi pendidik minimal 24 jam tatap muka per minggu.
Sistem memfasilitasi:
1. Penugasan guru ke mata pelajaran dan rombel spesifik per semester.
2. Pelacak persentase pemenuhan beban 24 jam secara *real-time*.
3. Penetapan Koordinator Mata Pelajaran (KGB / MGMP) untuk supervisi perangkat ajar.
