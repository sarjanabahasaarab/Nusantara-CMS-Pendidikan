/**
 * Nusantara Education CMS - Unit Test Suite
 * Menguji fondasi: Autentikasi, Otorisasi RBAC, Slug Generator, dan CMS CRUD
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { slugify, estimateReadingTime, formatBytes } from '../../src/lib/utils';
import { hasPermission, canAccessAdminRoute } from '../../src/lib/permissions';
import { User } from '../../src/types';

describe('1. Utility Functions Test', () => {
  it('harus menghasilkan URL slug yang ramah SEO dan bersih', () => {
    const raw = 'Sambutan Kepala Sekolah Menyambut Tahun Ajaran Baru 2026/2027!';
    const slug = slugify(raw);
    expect(slug).toBe('sambutan-kepala-sekolah-menyambut-tahun-ajaran-baru-20262027');
  });

  it('harus menghitung estimasi waktu membaca artikel secara akurat', () => {
    const text200words = new Array(200).fill('kata').join(' ');
    const time = estimateReadingTime(text200words);
    expect(time).toBe(1);

    const text450words = new Array(450).fill('pendidikan').join(' ');
    const timeLong = estimateReadingTime(text450words);
    expect(timeLong).toBe(3);
  });

  it('harus memformat ukuran berkas dengan benar', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(2097152)).toBe('2 MB');
  });
});

describe('2. RBAC & Access Control Test', () => {
  const superAdminUser: User = {
    id: 'u-1',
    name: 'Super Admin',
    email: 'admin@example.com',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const guruUser: User = {
    id: 'u-2',
    name: 'Ahmad Fauzi',
    email: 'guru@nusantara.sch.id',
    role: 'GURU',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const siswaUser: User = {
    id: 'u-3',
    name: 'Rizky',
    email: 'siswa@nusantara.sch.id',
    role: 'SISWA',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const inactiveUser: User = {
    id: 'u-4',
    name: 'Blocked User',
    email: 'blocked@nusantara.sch.id',
    role: 'ADMIN',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('SUPER_ADMIN harus memiliki akses ke seluruh hak istimewa (all permissions)', () => {
    expect(hasPermission(superAdminUser, 'dashboard.view')).toBe(true);
    expect(hasPermission(superAdminUser, 'users.delete')).toBe(true);
    expect(hasPermission(superAdminUser, 'settings.update')).toBe(true);
    expect(hasPermission(superAdminUser, 'audit.view')).toBe(true);
  });

  it('GURU harus dapat melihat dashboard dan membuat artikel, namun TIDAK boleh menghapus pengguna atau mengubah pengaturan situs', () => {
    expect(hasPermission(guruUser, 'dashboard.view')).toBe(true);
    expect(hasPermission(guruUser, 'posts.create')).toBe(true);
    expect(hasPermission(guruUser, 'users.delete')).toBe(false);
    expect(hasPermission(guruUser, 'settings.update')).toBe(false);
  });

  it('SISWA tidak boleh mengakses dashboard administrasi (harus ditolak)', () => {
    expect(canAccessAdminRoute(siswaUser, 'admin-dashboard')).toBe(false);
    expect(canAccessAdminRoute(siswaUser, 'admin-users')).toBe(false);
    expect(canAccessAdminRoute(siswaUser, 'admin-settings')).toBe(false);
  });

  it('Pengguna nonaktif (isActive: false) harus ditolak dari seluruh perizinan sistem', () => {
    expect(hasPermission(inactiveUser, 'dashboard.view')).toBe(false);
    expect(canAccessAdminRoute(inactiveUser, 'admin-dashboard')).toBe(false);
  });
});
