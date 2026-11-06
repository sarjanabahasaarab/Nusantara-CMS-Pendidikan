# Panduan Migrasi Basis Data Phase 4 — Nusantara Education CMS

## 1. Ikhtisar Perubahan Skema

Phase 4 menambahkan 21 model Prisma baru untuk mendukung Multi-Tenant SaaS dan Sistem Akademik:
- `Tenant`, `TenantDomain`, `TenantMembership`, `TenantSetting`, `TenantSubscription`, `TenantUsage`.
- `AcademicYear`, `AcademicTerm`.
- `Faculty`, `Department`, `StudyProgram`, `GradeLevel`, `AcademicClass`, `Room`.
- `Subject`, `Curriculum`, `CurriculumSubject`.
- `TeachingAssignment`, `ScheduleItem`, `LearningDocument`, `AcademicCalendarEvent`.

Semua model relasional ini telah didefinisikan lengkap di file `/prisma/schema.prisma`.

---

## 2. Langkah-Langkah Eksekusi Migrasi

### Menggunakan Prisma CLI:
```bash
# 1. Validasi sintaks schema Prisma
npx prisma validate

# 2. Buat file migration SQL baru
npx prisma migrate dev --name phase_4_multitenant_academic

# 3. Generate TypeScript Prisma Client yang telah diperbarui
npx prisma generate
```

### Jalankan Migrasi di Lingkungan Produksi:
```bash
npx prisma migrate deploy
```

---

## 3. Strategi Backward Compatibility

1. **Default Tenant:** Seluruh data eksisting dari Phase 1, 2, dan 3 secara otomatis diasosiasikan ke `tenant-sman-nusantara` sebagai sekolah percontohan default.
2. **Nullable / Fallback Default:** Kolom `tenantId` pada tabel pengguna dan konten memiliki fallback aman ke tenant primer jika tidak ditentukan.
3. **Storage Key Versioning:** Sistem penyimpanan lokal menggunakan `nusantara_cms_db_v4` yang secara otomatis memigrasikan dan menggabungkan data seed baru tanpa menghapus konten kustom pengguna dari fase sebelumnya.
