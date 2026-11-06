# Keamanan Multi-Tenant & Kebijakan Isolasi Data — Nusantara Education CMS

## 1. Prinsip Keamanan Multi-Tenant

Nusantara Education CMS menerapkan standar keamanan multi-tenant enterprise untuk menjamin data antar-institusi tidak pernah bocor atau diakses tanpa hak:
1. **Pemisahan Logis Ketat (Strict Logical Partitioning):** Seluruh baris data akademik terikat pada `tenantId`.
2. **Pertahanan Berlapis (Defense-in-Depth):** Pemeriksaan tenant dilakukan di level middleware, store/repository, permission guard, dan visual UI rendering.
3. **Prinsip Hak Akses Terkecil (Least Privilege):** Pengguna hanya diberikan akses ke institusi tempat mereka terdaftar sebagai anggota (`TenantMembership`).

---

## 2. Matriks Otorisasi Multi-Tenant

| Peran Pengguna | Akses Antar-Tenant | Akses Data Siswa | Modifikasi Kurikulum & Jadwal |
|---|---|---|---|
| **SUPER_ADMIN** | Seluruh Tenant (Global Override) | Seluruh Data Platform | Konfigurasi Global & Kuota |
| **ADMIN_SEKOLAH** | Terbatas pada Tenant Milik Sendiri | Seluruh Siswa di Tenant Tersebut | Penuh di Tenant Tersebut |
| **KEPALA_SEKOLAH** | Terbatas pada Tenant Milik Sendiri | Seluruh Siswa & Dewan Guru | Supervisi & Approval Dokumen |
| **GURU** | Terbatas pada Tenant Milik Sendiri | Siswa di Kelas yang Diampu | Submit Perangkat & Akses Jadwal Pribadi |
| **WALI_KELAS** | Terbatas pada Tenant Milik Sendiri | Siswa di Rombel Perwaliannya | Leger Nilai & Catatan Karakter Rombel |
| **SISWA** | Terbatas pada Tenant Milik Sendiri | Data Pribadi & Nilai Milik Sendiri | Read-Only Jadwal & Dokumen Terpublikasi |
| **ORANG_TUA** | Terbatas pada Tenant Milik Sendiri | Siswa yang Terhubung Sebagai Anak Asuh | Read-Only Rekap Kehadiran & Nilai Anak |

---

## 3. Audit Trail & Deteksi Pelanggaran

Setiap upaya akses lintas-tenant yang tidak sah:
1. Mengembalikan kode HTTP `403 Forbidden` atau melempar eksepsi otorisasi.
2. Mencatat insiden ke dalam `AuditLog` dengan menyertakan:
   - `userId` dan `userRole`.
   - `action`: `TENANT_ACCESS_DENIED`.
   - `details`: Percobaan akses ke `tenantId` target tanpa keanggotaan aktif.
   - `ipAddress` dan `timestamp`.
