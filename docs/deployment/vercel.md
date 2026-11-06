# Panduan Deployment Vercel — Nusantara Education CMS

Dokumen ini memandu proses deployment produksi **Nusantara Education CMS** pada platform Vercel dengan integrasi basis data PostgreSQL (Supabase / Neon / AWS RDS).

---

## 1. Persiapan Basis Data (PostgreSQL & Connection Pooling)

Pada arsitektur serverless seperti Vercel, setiap request dapat memicu instance serverless baru. Oleh karena itu, koneksi langsung ke PostgreSQL dapat menghabiskan connection pool.

### Menggunakan Supabase / Neon Connection Pooling:
Gunakan **Transaction Pooler** (Port `6543` pada Supabase) untuk runtime aplikasi, dan koneksi langsung (Session Mode Port `5432`) khusus saat menjalankan migrasi Prisma:

```env
# Runtime pooling URL (Transaction Mode)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct URL for Prisma Migrations (Session Mode)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

## 2. Environment Variables di Vercel Dashboard

Buka **Vercel Dashboard > Project Settings > Environment Variables** dan tambahkan:

| Variabel | Deskripsi | Contoh Nilai |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection pooler URI | `postgresql://...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection URI (Prisma migrate) | `postgresql://...:5432/postgres` |
| `NEXTAUTH_SECRET` | Kunci enkripsi sesi JWT NextAuth (32-char hex) | `openssl rand -hex 32` |
| `NEXTAUTH_URL` | Domain publik kanonikal website | `https://sman-nusantara.sch.id` |
| `NODE_ENV` | Mode lingkungan | `production` |
| `STORAGE_PROVIDER` | Driver penyimpanan media (`local`, `s3`, `cloudinary`) | `local` atau `s3` |

---

## 3. Konfigurasi `package.json` Build Script

Pastikan skrip build di `package.json` menyertakan generasi Prisma client otomatis sebelum Next.js build:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "prisma generate && vite build",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

---

## 4. Konfigurasi `vercel.json`

Gunakan file `vercel.json` pada root proyek untuk optimasi header keamanan dan caching aset publik:

```json
{
  "buildCommand": "npm run build",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 5. Menjalankan Migrasi Awal & Seed Data

Setelah menghubungkan Vercel dengan repositori Git:
1. Hubungkan CLI Vercel secara lokal:
   ```bash
   npx vercel link
   npx vercel env pull .env.production.local
   ```
2. Jalankan migrasi schema Prisma ke database produksi:
   ```bash
   npx prisma migrate deploy
   ```
3. Lakukan seeding data awal sekolah (akun administrator, kategori berjenjang, warta awal):
   ```bash
   npx tsx prisma/seed.ts
   ```

---

## 6. Verifikasi Pasca-Deployment

Periksa hal-hal berikut setelah URL produksi aktif:
- [x] Akses halaman publik beranda: Banner headline, agenda, warta berita, dan galeri tampil sempurna.
- [x] Login CMS: Masuk dengan kredensial administrator awal (`admin@example.com` / `AdminNusantara123!`).
- [x] Cek robots.txt: Buka `https://domain-anda/robots.txt` dan pastikan perutean `/admin/` diblokir dari crawler.
- [x] Cek sitemap.xml: Buka `https://domain-anda/sitemap.xml`.
