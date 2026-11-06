# Panduan Deployment Vercel & Multi-Tenant Wildcard Domain — Nusantara Education CMS

## 1. Arsitektur Deployment Vercel

Nusantara Education CMS dirancang untuk berjalan secara optimal pada infrastruktur cloud modern **Vercel** dengan fitur:
- Serverless Functions & Edge Routing.
- Wildcard Subdomain DNS Routing (`*.platform.id`).
- Custom Domain SSL Otomatis untuk setiap institusi sekolah (`*.sch.id` atau `*.ac.id`).

---

## 2. Variabel Lingkungan Produksi (Vercel Environment Variables)

Konfigurasikan variabel berikut pada dashboard Vercel (**Settings > Environment Variables**):

```env
# URL & Domain Platform
APP_URL="https://nusantara-cms.vercel.app"
PLATFORM_DOMAIN="nusantara.sch.id"

# Database PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/nusantara_cms?schema=public&sslmode=require"

# NextAuth / Auth.js
NEXTAUTH_URL="https://nusantara-cms.vercel.app"
NEXTAUTH_SECRET="kunci-enkripsi-rahasia-minimal-32-karakter"

# Storage & Upload Berkas
BLOB_READ_WRITE_TOKEN="vercel_blob_token_here"
```

---

## 3. Konfigurasi Wildcard Subdomain di Vercel

1. Buka project di Vercel Dashboard > **Settings > Domains**.
2. Tambahkan domain primer: `nusantara.sch.id`.
3. Tambahkan wildcard domain: `*.nusantara.sch.id`.
4. Tambahkan record DNS pada penyedia domain Anda:
   - Type: `CNAME`
   - Name: `*`
   - Target: `cname.vercel-dns.com`
5. Vercel akan otomatis menerbitkan sertifikat SSL Let's Encrypt untuk seluruh subdomain institusi baru.
