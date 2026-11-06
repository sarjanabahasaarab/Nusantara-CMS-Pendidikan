/**
 * Nusantara Education CMS - Prisma Database Seed Script
 * 
 * Script ini menginisialisasi database dengan data awal yang dibutuhkan:
 * 1. Seluruh permission default (Phase 1)
 * 2. Role standar (SUPER_ADMIN, ADMIN, KEPALA_SEKOLAH, GURU, SISWA, ORANG_TUA)
 * 3. Relasi Role-Permission
 * 4. User administrator utama (admin@example.com)
 * 5. Pengaturan website resmi (SiteSetting)
 * 6. Kategori berita & artikel
 * 7. Contoh artikel dan halaman statis awal
 * 8. Initial audit log
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Password hashing helper simulation (in real Node.js environment use bcrypt/argon2)
function hashPassword(password: string): string {
  // Dalam lingkungan produksi, selalu gunakan bcrypt.hashSync(password, 12)
  return `$2b$12$K8yQd1/JmR7l08f.9h2wCeV5jB2K29vV50h214nS9oV0oX0yN0CqW`; // Hash untuk default password
}

async function main() {
  console.log('🌱 Memulai proses seeding Nusantara Education CMS...');

  // 1. DAFTAR PERMISSION PHASE 1
  const permissionsData = [
    { name: 'dashboard.view', description: 'Melihat dashboard administrator', module: 'system' },
    { name: 'users.view', description: 'Melihat daftar pengguna', module: 'users' },
    { name: 'users.create', description: 'Membuat pengguna baru', module: 'users' },
    { name: 'users.update', description: 'Mengubah data pengguna', module: 'users' },
    { name: 'users.delete', description: 'Menghapus pengguna', module: 'users' },

    { name: 'roles.view', description: 'Melihat daftar role dan hak akses', module: 'roles' },
    { name: 'roles.manage', description: 'Mengatur hak akses dan permission', module: 'roles' },

    { name: 'posts.view', description: 'Melihat daftar artikel dan berita', module: 'posts' },
    { name: 'posts.create', description: 'Menulis artikel baru', module: 'posts' },
    { name: 'posts.update', description: 'Mengedit artikel', module: 'posts' },
    { name: 'posts.delete', description: 'Menghapus artikel', module: 'posts' },
    { name: 'posts.publish', description: 'Menerbitkan atau membatalkan terbitan artikel', module: 'posts' },

    { name: 'pages.view', description: 'Melihat daftar halaman website', module: 'pages' },
    { name: 'pages.create', description: 'Membuat halaman statis baru', module: 'pages' },
    { name: 'pages.update', description: 'Mengedit halaman website', module: 'pages' },
    { name: 'pages.delete', description: 'Menghapus halaman website', module: 'pages' },

    { name: 'media.view', description: 'Melihat pustaka media gambar dan berkas', module: 'media' },
    { name: 'media.upload', description: 'Mengunggah berkas ke pustaka media', module: 'media' },
    { name: 'media.delete', description: 'Menghapus berkas dari pustaka media', module: 'media' },

    { name: 'settings.view', description: 'Melihat pengaturan situs dan identitas sekolah', module: 'settings' },
    { name: 'settings.update', description: 'Mengubah konfigurasi website sekolah', module: 'settings' },

    { name: 'audit.view', description: 'Melihat rekaman jejak audit sistem', module: 'audit' },
  ];

  console.log(`Menginput ${permissionsData.length} permissions...`);
  const createdPermissions: Record<string, string> = {};

  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    createdPermissions[perm.name] = p.id;
  }

  // 2. DAFTAR ROLES DEFAULT
  const rolesData = [
    {
      name: 'SUPER_ADMIN',
      description: 'Akses penuh ke seluruh konfigurasi sistem, pengguna, dan konten.',
      permissions: Object.keys(createdPermissions), // All permissions
    },
    {
      name: 'ADMIN',
      description: 'Administrator CMS pengelola konten, artikel, halaman, dan media.',
      permissions: [
        'dashboard.view', 'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
        'pages.view', 'pages.create', 'pages.update', 'pages.delete',
        'media.view', 'media.upload', 'media.delete',
        'settings.view', 'settings.update', 'audit.view'
      ],
    },
    {
      name: 'KEPALA_SEKOLAH',
      description: 'Pimpinan institusi: melihat dashboard, audit log, persetujuan artikel dan laporan.',
      permissions: [
        'dashboard.view', 'posts.view', 'posts.publish',
        'pages.view', 'media.view', 'settings.view', 'audit.view'
      ],
    },
    {
      name: 'GURU',
      description: 'Pendidik: membuat dan memperbarui materi publikasi, berita kegiatan sekolah.',
      permissions: [
        'dashboard.view', 'posts.view', 'posts.create', 'posts.update',
        'media.view', 'media.upload'
      ],
    },
    {
      name: 'SISWA',
      description: 'Peserta didik: akses portal siswa (fondasi disiapkan untuk fase kesiswaan & raport).',
      permissions: ['posts.view'],
    },
    {
      name: 'ORANG_TUA',
      description: 'Wali murid: akses portal informasi pendidikan anak.',
      permissions: ['posts.view'],
    },
  ];

  console.log('Menginput roles dan konfigurasi hak akses...');
  const roleMap: Record<string, string> = {};

  for (const roleItem of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: roleItem.name },
      update: { description: roleItem.description },
      create: {
        name: roleItem.name,
        description: roleItem.description,
      },
    });
    roleMap[roleItem.name] = role.id;

    // Hubungkan Role dengan Permission
    for (const permName of roleItem.permissions) {
      const permId = createdPermissions[permName];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permId,
          },
        });
      }
    }
  }

  // 3. SEED ADMINISTRATOR UTAMA
  const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'AdminNusantara123!';

  console.log(`Membuat akun super admin default: ${defaultAdminEmail}...`);
  const adminUser = await prisma.user.upsert({
    where: { email: defaultAdminEmail },
    update: {},
    create: {
      name: 'Administrator Utama',
      email: defaultAdminEmail,
      passwordHash: hashPassword(defaultAdminPassword),
      phone: '+62 812-3456-7890',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // Berikan role SUPER_ADMIN
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: roleMap['SUPER_ADMIN'],
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: roleMap['SUPER_ADMIN'],
    },
  });

  // 4. SEED SITE SETTING (IDENTITAS SEKOLAH)
  console.log('Menginput pengaturan identitas institusi...');
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'SMA Negeri Nusantara Mandiri',
      tagline: 'Mencerdaskan Generasi Emas Bangsa Berakhlak Mulia & Berwawasan Global',
      description: 'Sistem Informasi dan Manajemen Konten Pendidikan Terpadu Sekolah Menengah Atas Nusantara Mandiri, mengedepankan inovasi, riset, sains, dan integritas moral.',
      logo: '/images/logo-nusantara.svg',
      favicon: '/favicon.ico',
      email: 'info@sman-nusantara.sch.id',
      phone: '(021) 7890-1234',
      address: 'Jl. Merdeka Pendidikan No. 45, Kompleks Kampus Pendidikan, Jakarta Pusat 10110',
      facebook: 'https://facebook.com/sman.nusantara',
      instagram: 'https://instagram.com/sman.nusantara',
      youtube: 'https://youtube.com/@sman.nusantara',
      tiktok: 'https://tiktok.com/@sman.nusantara',
    },
  });

  // 5. SEED KATEGORI ARTIKEL
  console.log('Menginput kategori berita & konten...');
  const categories = [
    { name: 'Pengumuman Resmi', slug: 'pengumuman-resmi', description: 'Informasi dan surat edaran resmi dari pihak institusi' },
    { name: 'Prestasi & Juara', slug: 'prestasi-dan-juara', description: 'Pencapaian peserta didik dan guru di kancah nasional maupun internasional' },
    { name: 'Kegiatan Sekolah', slug: 'kegiatan-sekolah', description: 'Dokumentasi acara, workshop, seminar, dan perayaan sekolah' },
    { name: 'Akademik & Kurikulum', slug: 'akademik-kurikulum', description: 'Informasi kalender akademik, ujian, dan pengembangan kurikulum' },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    catMap[cat.slug] = c.id;
  }

  // 6. SEED CONTOH ARTIKEL AWAL
  console.log('Menginput contoh artikel awal...');
  await prisma.post.upsert({
    where: { slug: 'sambutan-tahun-ajaran-baru-2026-2027' },
    update: {},
    create: {
      title: 'Sambutan Kepala Sekolah Menyambut Tahun Ajaran Baru 2026/2027',
      slug: 'sambutan-tahun-ajaran-baru-2026-2027',
      excerpt: 'Menyambut babak baru pembelajaran dengan kurikulum berbasis riset, kecerdasan digital, dan penguatan karakter bangsa.',
      content: `Selamat datang kepada seluruh civitas akademika, peserta didik baru, dan para orang tua di lingkungan SMA Negeri Nusantara Mandiri.\n\nTahun ajaran 2026/2027 menjadi momentum penting dalam transformasi pendidikan era modern. Kami berkomitmen untuk menghadirkan ekosistem pembelajaran yang kolaboratif, memfasilitasi minat bakat siswa secara maksimal, serta membina integritas luhur. Mari kita songsong masa depan dengan optimisme tinggi!`,
      status: 'PUBLISHED',
      authorId: adminUser.id,
      categoryId: catMap['pengumuman-resmi'],
      featuredImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop',
      publishedAt: new Date(),
      metaTitle: 'Sambutan Kepala Sekolah Tahun Ajaran Baru 2026/2027',
      metaDescription: 'Pesan hangat Kepala Sekolah menyambut peserta didik baru tahun ajaran 2026/2027 di SMA Nusantara.',
    },
  });

  // 7. SEED CONTOH HALAMAN
  console.log('Menginput halaman statis awal...');
  await prisma.page.upsert({
    where: { slug: 'tentang-kami' },
    update: {},
    create: {
      title: 'Tentang Sekolah Kami',
      slug: 'tentang-kami',
      excerpt: 'Mengenal sejarah, filosofi, dan dedikasi SMA Negeri Nusantara Mandiri dalam mencerdaskan kehidupan bangsa.',
      content: `SMA Negeri Nusantara Mandiri didirikan dengan visi menjadi pusat keunggulan pendidikan menengah di Indonesia yang mengintegrasikan sains, seni, teknologi mutakhir, dan keluhuran budi pekerti.\n\nDidukung oleh tenaga pendidik berpengalaman, laboratorium bertaraf internasional, serta lingkungan belajar yang asri dan aman, kami terus mengantarkan generasi muda mengukir prestasi gemilang.`,
      status: 'PUBLISHED',
      metaTitle: 'Profil & Sejarah SMA Negeri Nusantara Mandiri',
      metaDescription: 'Informasi lengkap mengenai profil, visi misi, dan fasilitas pendidikan di SMA Negeri Nusantara Mandiri.',
    },
  });

  // 8. INITIAL AUDIT LOG
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entity: 'SYSTEM',
      entityId: '0',
      details: 'Inisialisasi database dan konfigurasi awal Nusantara Education CMS Phase 1 berhasil.',
      ipAddress: '127.0.0.1',
      userAgent: 'Prisma Seeder Script',
    },
  });

  console.log('✅ Seeding database Nusantara Education CMS selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan pada proses seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
