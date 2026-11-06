# Manajemen Kurikulum & Capaian Pembelajaran — Nusantara Education CMS

## 1. Dukungan Multi-Kurikulum Nasional

Nusantara Education CMS Phase 4 dirancang mendukung standar kurikulum pendidikan terkini:
1. **Kurikulum Merdeka:**
   - Fokus pada Capaian Pembelajaran (CP), Fase Belajar (Fase A s.d. F), dan Tujuan Pembelajaran (TP).
   - Pengorganisasian pembelajaran berbasis diferensiasi dan Profil Pelajar Pancasila (P5).
2. **Kurikulum 2013 (K13 Revisi):**
   - Struktur Kompetensi Inti (KI-1, KI-2, KI-3, KI-4) dan Kompetensi Dasar (KD).
3. **Outcome-Based Education (OBE) & Kampus Merdeka (MBKM):**
   - Capaian Pembelajaran Lulusan (CPL), Capaian Pembelajaran Mata Kuliah (CPMK), dan Sub-CPMK.
   - Penyelarasan Kerangka Kualifikasi Nasional Indonesia (KKNI) dan akreditasi internasional.

---

## 2. Struktur Data Capaian & Tujuan Pembelajaran

Setiap mata pelajaran dalam kurikulum (`CurriculumSubject`) menyimpan:
- **Capaian Pembelajaran (CP / CPL):** Narasi komprehensif kompetensi yang harus dicapai pada akhir fase atau semester.
- **Tujuan Pembelajaran (TP / CPMK):** Butir-butir spesifik keterampilan, pengetahuan, dan sikap yang terukur.
- **Alokasi Jam Tatap Muka Per Minggu (JP/SKS).**
- **Status Wajib / Pilihan.**

---

## 3. Alur Persetujuan Perangkat Ajar (Approval Workflow)

Guru dan dosen mengunggah berkas perangkat pembelajaran (Modul Ajar, RPP Diferensiasi, Silabus, RPS) melalui antarmuka CMS dengan alur pengawasan 4-tahap:

```
[ DRAFT ] 
    │ Guru menyusun deskripsi, rubrik penilaian, dan melampirkan berkas PDF/Docx
    ▼
[ SUBMITTED ]
    │ Diajukan ke Kepala Sekolah, Wakil Bidang Kurikulum, atau Ketua Jurusan/Kaprodi
    ▼
[ REVIEW ] ──── (Jika ada perbaikan) ───► [ REVISION ]
    │                                          │ Catatan revisi spesifik dari supervisor
    │                                          └──► Guru memperbaiki & submit ulang
    ▼
[ APPROVED ]
    Dokumen disetujui, diberi stempel digital reviewer, dan siap diimplementasikan
```

Semua aksi submit, approval, dan penolakan dicatat dalam `AuditLog` dengan cap waktu dan identitas verifikator.
