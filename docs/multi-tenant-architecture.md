# Arsitektur Multi-Tenant SaaS — Nusantara Education CMS

## 1. Ikhtisar Arsitektur

Nusantara Education CMS Phase 4 mentransformasikan platform dari instalasi satu sekolah menjadi **Multi-Tenant Software-as-a-Service (SaaS)** tingkat enterprise untuk seluruh jenjang pendidikan nasional di Indonesia:
- **Pendidikan Dasar & Menengah (K-12):** SD, SMP, SMA, SMK, Madrasah.
- **Pendidikan Tinggi:** Universitas, Politeknik, Institut, Sekolah Tinggi, Akademi.

Setiap institusi beroperasi dalam ruang data terisolasi (*logical tenant partitioning*) yang aman dengan subdomain sendiri (misal `sman1nusantara.platform.id` atau `poltek.ac.id`), paket langganan berjenjang, dan identitas kelembagaan mandiri.

---

## 2. Model Basis Data Multi-Tenant

| Entitas | Deskripsi | Atribut Kunci |
|---|---|---|
| **Tenant** | Data master institusi pendidikan | `id`, `name`, `slug`, `type`, `status`, `subdomain`, `npsn`, `logo`, `banner` |
| **TenantDomain** | Pemetaan domain institusi | `id`, `tenantId`, `domain`, `isPrimary`, `isVerified`, `sslStatus` |
| **TenantMembership** | Hubungan pengguna dengan institusi | `id`, `tenantId`, `userId`, `role` (`OWNER`, `ADMIN`, `MEMBER`), `status` |
| **TenantSetting** | Konfigurasi lokal sekolah/kampus | `tenantId`, `siteName`, `tagline`, `contactEmail`, `contactPhone`, `socialLinks` |
| **TenantSubscription** | Paket SaaS & kuota institusi | `tenantId`, `plan` (`FREE`, `BASIC`, `PROFESSIONAL`, `ENTERPRISE`), `maxUsers`, `maxStudents` |
| **TenantUsage** | Penggunaan kuota riil | `tenantId`, `currentUsers`, `currentStudents`, `storageUsedMb` |

Semua tabel data operasional (seperti `AcademicYear`, `AcademicClass`, `Subject`, `Curriculum`, `ScheduleItem`, `LearningDocument`, `Event`, `Post`) memiliki atribut wajib:
```prisma
tenantId  String
tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
```

---

## 3. Strategi Isolasi Tenant (Tenant Isolation)

Isolasi data dijamin pada beberapa tingkatan:
1. **Server & Database Layer:** Setiap query secara otomatis menyertakan predikat `WHERE tenantId = :activeTenantId`.
2. **Permission Layer:** Fungsi `canAccessTenant(user, targetTenantId, memberships)` memvalidasi apakah pengguna memiliki hak akses pada tenant tersebut. Hanya pengguna dengan peran `SUPER_ADMIN` yang dapat melakukan lintas-tenant bypass untuk administrasi global.
3. **Store Layer:** Fungsi `filterByTenant(items, targetTenantId, isSuperAdmin)` menyaring seluruh koleksi sebelum dikirimkan ke lapisan antarmuka.

---

## 4. Alur Onboarding Institusi Mandiri (Self-Service Registration)

1. Calon admin institusi membuka portal `/register-institution` atau klik tautan "Daftar Institusi Baru" pada halaman login.
2. Mengisi formulir 2-langkah:
   - **Langkah 1:** Identitas Institusi (Nama, Jenjang SD/SMP/SMA/SMK/Universitas, NPSN/Nomor Izin, Subdomain pilihan).
   - **Langkah 2:** Akun Administrator Utama (Nama Lengkap, Email Dinas, Nomor WhatsApp, Kata Sandi).
3. Sistem secara atomik mengeksekusi `cmsStore.registerInstitution()`:
   - Memvalidasi keunikan subdomain dan email.
   - Menginisialisasi `Tenant`.
   - Membuat akun pengguna dengan role `ADMIN_SEKOLAH`.
   - Mengaitkan `TenantMembership` dengan level `OWNER`.
   - Mengalokasikan paket gratis default `FREE` (hingga 25 pendidik & 200 siswa).
   - Menginisialisasi `TenantSetting` dan `AcademicYear` aktif pertama.
4. Administrator langsung dialihkan ke dashboard untuk mulai mengatur struktur institusi.

---

## 5. Model Paket & Langganan (Freemium SaaS)

| Fitur / Batasan | Free Tier | Basic Tier | Professional Tier | Enterprise Tier |
|---|---|---|---|---|
| **Maksimal Siswa/Mhs** | 200 | 500 | 2.000 | Tanpa Batas |
| **Maksimal Guru/Staff** | 25 | 60 | 200 | Tanpa Batas |
| **Penyimpanan Berkas** | 2 GB | 10 GB | 100 GB | 1 TB Dedicated |
| **Custom Domain** | ❌ (Subdomain platform) | ❌ | ✅ (`sekolah.sch.id`) | ✅ Multi-Domain SSL |
| **Kurikulum Merdeka / OBE**| Dasar | Lengkap | Lengkap | Kustom / Dual |
| **Jadwal Anti-Tabrakan** | ✅ Aktif | ✅ Aktif | ✅ Aktif | ✅ Aktif |
| **Akses REST API & Webhook** | ❌ | ❌ | ✅ | ✅ Full Access |
| **Dukungan Teknis** | Komunitas | Email 48 jam | Email & WA Prioritas | SLA 99.9% 24/7 |
