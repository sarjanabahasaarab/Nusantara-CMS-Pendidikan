# Sistem Penilaian, Ujian CBT, dan Rapor Multi-Tenant (Phase 5)
## Nusantara Education CMS

Dokumen ini menjelaskan rancangan sistem penilaian terintegrasi, bank soal, pelaksanaan ujian CBT, penyusunan rapor K-12, dan transkrip akademik perguruan tinggi.

---

### 1. Struktur Komponen Nilai & Bobot (Assessments)

#### A. Komponen Penilaian
Institusi dapat menentukan komponen penilaian fleksibel per mata pelajaran / program studi:
- **TUGAS** (Bobot: 15% - 25%)
- **KUIS** (Bobot: 10% - 15%)
- **FORMATIF / ULANGAN HARIAN** (Bobot: 20% - 30%)
- **SUMATIF TENGAH SEMESTER (STS)** (Bobot: 20%)
- **SUMATIF AKHIR SEMESTER (SAS) / UAS** (Bobot: 25% - 35%)
- **PRAKTIK / PORTOFOLIO / PROJEK P5**

#### B. Capaian Pembelajaran & Tujuan Pembelajaran (CP / TP)
- Setiap komponen penilaian dapat dihubungkan dengan kode CP dan deskripsi TP.
- Deskripsi pencapaian kompetensi otomatis ditarik saat kompilasi buku rapor.

#### C. Penguncian Nilai (Lock Mechanism) & Audit Revisi
- Guru pengampu dapat mengunci nilai komponen setelah batas waktu input berakhir.
- Nilai yang telah dikunci tidak dapat dimanipulasi secara sepihak.
- Perubahan nilai wajib menyertakan alasan revisi (`revisionReason`), tercatat pada tabel `GradeRevision` yang memuat skor lama, skor baru, validator, dan cap waktu audit log.

---

### 2. Bank Soal & Mesin Ujian CBT (Examinations)

#### A. Klasifikasi Butir Soal
Mendukung 5 jenis butir soal interaktif:
1. **Pilihan Ganda (Single Choice)** — 1 jawaban benar.
2. **Pilihan Ganda Kompleks (Multi Select)** — Lebih dari 1 jawaban benar dengan validasi multi-kunci.
3. **Benar / Salah (True or False)** — Pilihan biner pemahaman konsep.
4. **Menjodohkan (Matching Pair)** — Pasangan premis dan jawaban.
5. **Esai / Uraian** — Jawaban deskriptif dengan rubrik penilaian manual oleh guru.

#### B. Taksonomi Bloom
Soal dapat dilabeli tingkat kognitif: `C1` (Mengingat), `C2` (Memahami), `C3` (Menerapkan), `C4` (Menganalisis), `C5` (Mengevaluasi), dan `C6` (Mencipta).

#### C. CBT Engine & Penilaian Otomatis
- Pengerjaan ujian online didukung penghitung waktu mundur (*exam countdown timer*).
- Soal objektif dinilai secara instan setelah siswa menekan tombol "Kirim Jawaban".
- Soal esai otomatis masuk ke antrean koreksi (*manual essay grading queue*) pada dashboard guru penguji.

---

### 3. Buku Rapor Sekolah (K-12: SD, SMP, SMA, SMK)

#### A. Kompilasi Nilai Otomatis
- Menghitung nilai akhir mata pelajaran berbasis bobot komponen yang terdaftar.
- Menentukan predikat (`A` Sangat Baik, `B` Baik, `C` Cukup, `D` Perlu Pendampingan).
- Mengintegrasikan rekapitulasi kehadiran semesteran secara otomatis.

#### B. Alur Pengesahan Berjenjang (Approval Pipeline)
1. `DRAFT`: Nilai dan deskripsi capaian pembelajaran disusun oleh sistem & wali kelas.
2. `CHECKED`: Diperiksa dan divalidasi oleh Wali Kelas.
3. `APPROVED`: Disahkan secara resmi oleh Kepala Sekolah dan diterbitkan ke portal siswa dan orang tua.

#### C. Tampilan Cetak Resmi Kop Surat
- Dilengkapi Kop Surat institusi, logo, identitas lengkap siswa, tabel nilai KKM, rekapitulasi ketidakhadiran, catatan khusus wali kelas, serta kolom tanda tangan kepala sekolah ber-barcode validasi.

---

### 4. Perguruan Tinggi: KHS, SKS, IPS, IPK, dan Transkrip Kumulatif

#### A. Kartu Hasil Studi (KHS)
- Perhitungan SKS per mata kuliah.
- Konversi nilai angka ke huruf dan angka mutu (A = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, D = 1.0, E = 0.0).
- Perhitungan Indeks Prestasi Semester (IPS) dan Indeks Prestasi Kumulatif (IPK).

#### B. Transkrip Akademik Resmi
- Memuat riwayat seluruh mata kuliah yang telah ditempuh selama masa studi.
- Perhitungan predikat kelulusan (*Dengan Pujian / Cum Laude*, *Sangat Memuaskan*, *Memuaskan*).

---

### 5. Sidang Pleno Keputusan Akademik (Kenaikan Kelas & Kelulusan)

- Penetapan status siswa (`PROMOTED`, `RETAINED`, `GRADUATED`) melalui rapat pleno dewan guru / senat akademik.
- Pencatatan nomor Surat Keputusan (SK) resmi dan tanggal penetapan.
- Pembaruan otomatis status rombel atau status alumni pada profil peserta didik.
