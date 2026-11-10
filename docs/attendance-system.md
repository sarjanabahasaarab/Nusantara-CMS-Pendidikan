# Sistem Presensi & Kehadiran Multi-Tenant (Phase 5)
## Nusantara Education CMS

Dokumen teknis ini mendokumentasikan arsitektur, basis data, dan alur kerja Sistem Presensi dan Kehadiran pada Nusantara Education CMS.

---

### 1. Model Kehadiran & Jenis Presensi

Sistem mendukung 8 jenis status kehadiran standar pendidikan nasional:
1. **HADIR** — Mengikuti proses belajar mengajar secara penuh.
2. **SAKIT** — Berhalangan hadir karena alasan kesehatan (dapat menyertakan surat dokter).
3. **IZIN** — Berhalangan hadir dengan pemberitahuan resmi dari orang tua/wali.
4. **ALPA** — Tidak hadir tanpa keterangan yang sah.
5. **TERLAMBAT** — Hadir melewati batas toleransi waktu (tercatat durasi keterlambatan dalam menit).
6. **DISPENSASI** — Mengikuti kegiatan sekolah/kampus, perlombaan, atau OSIS.
7. **DINAS** — Penugasan resmi institusi bagi guru atau tenaga kependidikan.
8. **LIBUR** — Kalender akademik tanggal merah atau libur semester.

---

### 2. Presensi Siswa & Mahasiswa

#### A. Moda Presensi
- **Presensi Harian (Sekolah)**: Digunakan untuk mencatat kehadiran per kelas setiap pagi oleh wali kelas atau guru piket.
- **Presensi Mata Pelajaran / Jam Pelajaran**: Digunakan oleh guru pengampu mata pelajaran untuk setiap jam pelajaran/tatap muka.
- **Presensi Perkuliahan (Perguruan Tinggi)**: Pencatatan per mata kuliah/kelompok perkuliahan dosen.

#### B. Mekanisme Anti-Duplikasi (Anti-Duplicate Session)
Sistem menerapkan validasi integritas data:
- Mencegah pembuatan dua sesi presensi aktif untuk kelas yang sama, tanggal yang sama, dan mata pelajaran yang sama.
- Bila sesi sudah ada, sistem mengarahkan pengajar untuk memperbarui lembar presensi yang telah terdaftar.

#### C. Batasan Kewenangan Pendidik
- Guru hanya diizinkan membuka sesi presensi untuk rombel dan mata pelajaran yang tercantum dalam surat penugasan mengajar (`TeachingAssignment`).
- Wali kelas memiliki akses supervisi penuh atas rombel bimbingannya.

---

### 3. Presensi Mandiri & Presensi Pegawai

1. **Check-In & Check-Out Mandiri**:
   - Guru dan tenaga kependidikan dapat melakukan presensi mandiri saat tiba di sekolah/kampus melalui portal masing-masing.
   - Sistem mencatat waktu kedatangan (`checkInTime`) dan otomatis mendeteksi status `TERLAMBAT` serta menghitung menit keterlambatan apabila melewati batas toleransi (07:15).
2. **Input Manual oleh Administrator / Bagian Kepegawaian**:
   - Koreksi absensi guru dan staf jika ada kendala jaringan atau tugas dinas luar.

---

### 4. Pengajuan Izin / Sakit / Cuti (Leave Requests)

1. **Pengajuan Multi-Aktor**:
   - Siswa dapat mengajukan izin sakit mandiri via Portal Siswa.
   - Orang tua/wali dapat mengirimkan surat permohonan izin via Portal Orang Tua.
   - Guru dan staf dapat mengajukan permohonan izin via dashboard staf.
2. **Workflow Persetujuan**:
   - Permohonan berstatus `MENUNGGU` (`PENDING`).
   - Diverifikasi oleh Wali Kelas atau Kepala Bagian Kepegawaian (`DISETUJUI` / `DITOLAK`).
   - Apabila disetujui, sistem secara otomatis memperbarui catatan kehadiran siswa/pegawai terkait.
   - Sistem mengirimkan notifikasi internal otomatis kepada pemohon mengenai status permohonan.

---

### 5. Rekap Presensi & Analitik

- **Rekap Bulanan & Semester**: Menghitung total hadir, sakit, izin, alpa, dan persentase kehadiran (`attendancePercentage`).
- **Peringatan Dini (Early Warning)**:
  - Siswa dengan persentase kehadiran di bawah 85% ditandai warna kuning.
  - Siswa dengan kehadiran di bawah 75% ditandai warna merah sebagai indikator risiko ketidaktuntasan akademik.
- **Ekspor & Cetak**: Tampilan cetak resmi rekap presensi kelas berformat Kop Surat.
