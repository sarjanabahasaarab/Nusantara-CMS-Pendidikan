/**
 * Nusantara Education CMS - E2E Test Specifications (Playwright)
 * Phase 2 Complete Content Workflow:
 * Login -> Dashboard -> Grouped Sidebar -> Artikel & Berita -> Kategori Berjenjang -> Menu Builder -> Moderasi Komentar -> Logout
 */

import { test, expect } from '@playwright/test';

test.describe('Nusantara Education CMS - Phase 2 End-to-End Suite', () => {
  test('Alur Penuh CMS Konten: Autentikasi -> Artikel Tabs -> Kategori -> Menu -> Logout', async ({ page }) => {
    // 1. Kunjungi beranda publik
    await page.goto('/');
    await expect(page).toHaveTitle(/Nusantara Education CMS/);

    // 2. Klik tombol "Portal CMS" di navbar
    const portalBtn = page.getByRole('button', { name: /Portal CMS/i });
    if (await portalBtn.isVisible()) {
      await portalBtn.click();
    }

    // 3. Masukkan kredensial login
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'AdminNusantara123!');
    await page.click('button[type="submit"]');

    // 4. Verifikasi berhasil masuk ke dashboard admin
    await expect(page.locator('text=Nusantara CMS')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Ringkasan Dashboard')).toBeVisible();

    // 5. Masuk ke modul Konten -> Artikel
    await page.click('button:has-text("Artikel")');
    await expect(page.locator('text=Manajemen Artikel Edukasi')).toBeVisible();

    // 6. Verifikasi keberadaan filter tab status: Semua, Tayang, Terjadwal, Draf, Sampah
    await expect(page.locator('button:has-text("Semua")')).toBeVisible();
    await expect(page.locator('button:has-text("Tayang")')).toBeVisible();
    await expect(page.locator('button:has-text("Terjadwal")')).toBeVisible();
    await expect(page.locator('button:has-text("Draf")')).toBeVisible();
    await expect(page.locator('button:has-text("Sampah")')).toBeVisible();

    // 7. Masuk ke modul Taksonomi -> Kategori Berjenjang
    await page.click('button:has-text("Kategori Berjenjang")');
    await expect(page.locator('text=Kategori Berjenjang (Hierarchical Taxonomy)')).toBeVisible();

    // 8. Masuk ke modul Media & Navigasi -> Menu Navigasi
    await page.click('button:has-text("Menu Navigasi")');
    await expect(page.locator('text=Penyusun Menu Navigasi Website (Menu Builder)')).toBeVisible();

    // 9. Masuk ke modul Interaksi -> Moderasi Komentar
    await page.click('button:has-text("Moderasi Komentar")');
    await expect(page.locator('text=Moderasi Komentar Pengunjung')).toBeVisible();

    // 10. Keluar dari sesi (Logout)
    await page.click('button[title="Keluar dari sesi"]');
    await expect(page.locator('text=Masuk Portal CMS')).toBeVisible();
  });
});
