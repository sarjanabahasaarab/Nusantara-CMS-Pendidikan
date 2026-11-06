import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Newspaper,
  Layers,
  Megaphone,
  Calendar,
  Image as ImageIcon,
  FolderTree,
  Tag as TagIcon,
  Navigation,
  MessageSquare,
  Users,
  Shield,
  Globe,
  Settings,
  Activity,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  HeartHandshake,
  Briefcase,
  Award,
  Mail,
  FileSpreadsheet,
  Sliders,
  CheckCircle2,
  Building2,
  CreditCard,
  School,
  Compass,
  DoorOpen,
  Sparkles,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTheme } from '../../lib/theme/ThemeContext';
import { hasPermission } from '../../lib/permissions';
import { ActiveNav, SiteSetting, AuditLog, PermissionCode, RoleName } from '../../types';
import { cmsStore } from '../../lib/db';
import { Badge } from '../ui/Badge';
import { Breadcrumbs } from '../ui/Breadcrumbs';

interface AdminLayoutProps {
  settings: SiteSetting;
  currentNav: ActiveNav;
  onNavigate: (nav: ActiveNav) => void;
  auditLogs: AuditLog[];
  children: React.ReactNode;
}

interface NavGroup {
  groupName: string;
  items: {
    id: ActiveNav;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    permission: PermissionCode;
    badge?: number;
  }[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  settings,
  currentNav,
  onNavigate,
  auditLogs,
  children,
}) => {
  const { user, logout, switchUser, activeTenant, userTenants, switchTenant } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Hitung jumlah komentar yang perlu moderasi
  const pendingCommentsCount = cmsStore.getComments().filter((c) => c.status === 'PENDING').length;
  // Hitung jumlah undangan aktif
  const pendingInvitesCount = cmsStore.getInvitations().filter((i) => i.status === 'PENDING').length;

  // Grup Navigasi Sidebar Berjenjang (Phase 4 Multi-Tenant SaaS & Full Academic System)
  const navGroups: NavGroup[] = [
    {
      groupName: 'Ringkasan',
      items: [
        {
          id: 'admin-dashboard',
          label: 'Dashboard Umum',
          icon: LayoutDashboard,
          permission: 'dashboard.view',
        },
        {
          id: 'admin-academic-dashboard',
          label: 'Pusat Akademik',
          icon: Compass,
          permission: 'academic.view',
        },
      ],
    },
    {
      groupName: 'Multi-Tenant & SaaS',
      items: [
        {
          id: 'admin-tenants',
          label: 'Manajemen Tenant',
          icon: Building2,
          permission: 'tenants.manage',
        },
        {
          id: 'admin-subscriptions',
          label: 'Paket & Kuota SaaS',
          icon: CreditCard,
          permission: 'tenants.manage',
        },
        {
          id: 'admin-institution-profile',
          label: 'Identitas Sekolah',
          icon: School,
          permission: 'institution.manage',
        },
      ],
    },
    {
      groupName: 'Akademik & Kurikulum',
      items: [
        {
          id: 'admin-academic-years',
          label: 'Tahun Ajaran & Semester',
          icon: Calendar,
          permission: 'academic.years.manage',
        },
        {
          id: 'admin-academic-structure',
          label: 'Struktur Jenjang & Rombel',
          icon: Layers,
          permission: 'classes.manage',
        },
        {
          id: 'admin-rooms',
          label: 'Ruangan & Sarpras',
          icon: DoorOpen,
          permission: 'classes.manage',
        },
        {
          id: 'admin-subjects',
          label: 'Mata Pelajaran & SKS',
          icon: BookOpen,
          permission: 'subjects.manage',
        },
        {
          id: 'admin-curriculum',
          label: 'Kurikulum & Capaian (CP/TP)',
          icon: Sparkles,
          permission: 'curriculum.manage',
        },
        {
          id: 'admin-teaching-assignments',
          label: 'Penugasan Guru (Beban 24J)',
          icon: GraduationCap,
          permission: 'curriculum.manage',
        },
        {
          id: 'admin-schedules',
          label: 'Jadwal & Anti-Tabrakan',
          icon: Clock,
          permission: 'schedules.manage',
        },
        {
          id: 'admin-learning-docs',
          label: 'Perangkat Ajar (RPP/Modul)',
          icon: FileText,
          permission: 'curriculum.manage',
        },
        {
          id: 'admin-academic-calendar',
          label: 'Kalender Akademik',
          icon: Calendar,
          permission: 'academic.calendar.manage',
        },
      ],
    },
    {
      groupName: 'Kelembagaan & Pengguna',
      items: [
        {
          id: 'admin-users',
          label: 'Semua Pengguna',
          icon: Users,
          permission: 'users.view',
        },
        {
          id: 'admin-teachers',
          label: 'Pendidik & Guru',
          icon: GraduationCap,
          permission: 'teachers.view',
        },
        {
          id: 'admin-students',
          label: 'Peserta Didik (Siswa)',
          icon: UserCheck,
          permission: 'students.view',
        },
        {
          id: 'admin-parents',
          label: 'Orang Tua / Wali',
          icon: HeartHandshake,
          permission: 'parents.view',
        },
        {
          id: 'admin-staff',
          label: 'Tenaga Kependidikan',
          icon: Briefcase,
          permission: 'staff.view',
        },
        {
          id: 'admin-homeroom',
          label: 'Wali Kelas & Rombel',
          icon: Award,
          permission: 'homeroom.view',
        },
        {
          id: 'admin-invitations',
          label: 'Undangan Akun',
          icon: Mail,
          permission: 'invitations.view',
          badge: pendingInvitesCount > 0 ? pendingInvitesCount : undefined,
        },
      ],
    },
    {
      groupName: 'Akses & Otorisasi',
      items: [
        {
          id: 'admin-roles',
          label: 'Peran & Hak Akses',
          icon: Shield,
          permission: 'roles.view',
        },
        {
          id: 'admin-permissions',
          label: 'Matriks Izin Modular',
          icon: Sliders,
          permission: 'permissions.view',
        },
      ],
    },
    {
      groupName: 'Data & Integrasi',
      items: [
        {
          id: 'admin-import-export',
          label: 'Batch Import & Export',
          icon: FileSpreadsheet,
          permission: 'users.import',
        },
      ],
    },
    {
      groupName: 'Konten Edukasi',
      items: [
        {
          id: 'admin-posts',
          label: 'Artikel Edukasi',
          icon: FileText,
          permission: 'posts.view',
        },
        {
          id: 'admin-news',
          label: 'Warta & Berita',
          icon: Newspaper,
          permission: 'posts.view',
        },
        {
          id: 'admin-pages',
          label: 'Halaman Statis',
          icon: Layers,
          permission: 'pages.view',
        },
        {
          id: 'admin-announcements',
          label: 'Pengumuman Resmi',
          icon: Megaphone,
          permission: 'announcements.manage',
        },
        {
          id: 'admin-events',
          label: 'Agenda Kegiatan',
          icon: Calendar,
          permission: 'events.manage',
        },
        {
          id: 'admin-gallery',
          label: 'Galeri Foto',
          icon: ImageIcon,
          permission: 'gallery.manage',
        },
      ],
    },
    {
      groupName: 'Taksonomi & Media',
      items: [
        {
          id: 'admin-categories',
          label: 'Kategori Berjenjang',
          icon: FolderTree,
          permission: 'categories.manage',
        },
        {
          id: 'admin-tags',
          label: 'Tag Konten',
          icon: TagIcon,
          permission: 'tags.manage',
        },
        {
          id: 'admin-media',
          label: 'Pustaka Berkas',
          icon: ImageIcon,
          permission: 'media.view',
        },
        {
          id: 'admin-menus',
          label: 'Menu Navigasi',
          icon: Navigation,
          permission: 'menus.manage',
        },
        {
          id: 'admin-comments',
          label: 'Moderasi Komentar',
          icon: MessageSquare,
          permission: 'comments.manage',
          badge: pendingCommentsCount > 0 ? pendingCommentsCount : undefined,
        },
      ],
    },
    {
      groupName: 'Sistem & Keamanan',
      items: [
        {
          id: 'admin-seo',
          label: 'SEO & Sitemap',
          icon: Globe,
          permission: 'seo.manage',
        },
        {
          id: 'admin-settings',
          label: 'Pengaturan Sekolah',
          icon: Settings,
          permission: 'settings.view',
        },
        {
          id: 'admin-activity-logs',
          label: 'Log Aktivitas & Audit',
          icon: Activity,
          permission: 'audit.view',
        },
      ],
    },
  ];

  const handleNav = (nav: ActiveNav) => {
    onNavigate(nav);
    setMobileDrawerOpen(false);
  };

  const getBreadcrumbLabel = () => {
    switch (currentNav) {
      case 'admin-dashboard':
        return 'Ringkasan Dashboard';
      case 'admin-users':
        return 'Manajemen Pengguna';
      case 'admin-teachers':
        return 'Direktori Tenaga Pendidik & Guru';
      case 'admin-students':
        return 'Buku Induk Peserta Didik';
      case 'admin-parents':
        return 'Data Orang Tua & Wali Murid';
      case 'admin-staff':
        return 'Tenaga Kependidikan & Tata Usaha';
      case 'admin-homeroom':
        return 'Penugasan Wali Kelas & Rombel';
      case 'admin-invitations':
        return 'Undangan Pengguna & Token Registrasi';
      case 'admin-roles':
        return 'Role & Hak Akses';
      case 'admin-permissions':
        return 'Matriks Izin Akses Modular';
      case 'admin-import-export':
        return 'Batch CSV Import & Export Data';
      case 'admin-activity-logs':
      case 'admin-audit':
        return 'Rekaman Audit Trail & Log Keamanan';
      case 'admin-posts':
        return 'Manajemen Artikel';
      case 'admin-post-create':
        return 'Tulis Artikel Baru';
      case 'admin-post-edit':
        return 'Edit Artikel';
      case 'admin-news':
        return 'Manajemen Berita';
      case 'admin-news-create':
        return 'Tulis Berita Baru';
      case 'admin-news-edit':
        return 'Edit Berita';
      case 'admin-pages':
        return 'Manajemen Halaman Statis';
      case 'admin-page-create':
        return 'Buat Halaman Baru';
      case 'admin-page-edit':
        return 'Edit Halaman';
      case 'admin-announcements':
        return 'Manajemen Pengumuman';
      case 'admin-events':
        return 'Manajemen Agenda Kegiatan';
      case 'admin-gallery':
        return 'Manajemen Galeri Foto';
      case 'admin-categories':
        return 'Kategori Konten';
      case 'admin-tags':
        return 'Tag Konten';
      case 'admin-media':
        return 'Pustaka Berkas & Media';
      case 'admin-menus':
        return 'Penyusun Menu Navigasi';
      case 'admin-comments':
        return 'Moderasi Komentar';
      case 'admin-seo':
        return 'SEO Global & Sitemap';
      case 'admin-settings':
        return 'Pengaturan Website Institusi';
      case 'admin-academic-dashboard':
        return 'Pusat Komando Akademik & Kurikulum';
      case 'admin-tenants':
        return 'Manajemen Institusi & Multi-Tenant SaaS';
      case 'admin-subscriptions':
        return 'Manajemen Paket Langganan & Kuota Tenant';
      case 'admin-institution-profile':
        return 'Identitas & Profil Resmi Institusi';
      case 'admin-academic-years':
        return 'Tahun Ajaran & Periode Akademik Aktif';
      case 'admin-academic-structure':
        return 'Struktur Jenjang, Jurusan & Rombongan Belajar';
      case 'admin-rooms':
        return 'Sarana Prasarana & Manajemen Ruang Kelas';
      case 'admin-subjects':
        return 'Mata Pelajaran & Beban SKS/JP Kurikulum';
      case 'admin-curriculum':
        return 'Manajemen Kurikulum & Capaian (CP/TP)';
      case 'admin-teaching-assignments':
        return 'Distribusi Beban Mengajar Guru (Standar 24 Jam)';
      case 'admin-schedules':
        return 'Jadwal Pelajaran & Deteksi Tabrakan 3 Arah';
      case 'admin-learning-docs':
        return 'Perangkat Ajar (RPP, Silabus, Modul & RPS)';
      case 'admin-academic-calendar':
        return 'Kalender Akademik & Agenda Institusi';
      default:
        return 'Panel CMS';
    }
  };

  const isNavActive = (itemId: ActiveNav) => {
    if (currentNav === itemId) return true;
    if (itemId === 'admin-posts' && (currentNav === 'admin-post-create' || currentNav === 'admin-post-edit')) return true;
    if (itemId === 'admin-news' && (currentNav === 'admin-news-create' || currentNav === 'admin-news-edit')) return true;
    if (itemId === 'admin-pages' && (currentNav === 'admin-page-create' || currentNav === 'admin-page-edit')) return true;
    if (itemId === 'admin-activity-logs' && currentNav === 'admin-audit') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors text-slate-800 dark:text-slate-100">
      {/* 1. SIDEBAR DESKTOP */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transition-all duration-300 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div
            onClick={() => handleNav('admin-dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate block">
                  Nusantara CMS
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
                  Phase 4 Multi-Tenant & Academic
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Kecilkan/Perluas sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation Links (Grouped) */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.groupName}
                </div>
              )}
              {group.items.map((item) => {
                const hasAccess = hasPermission(user, item.permission);
                const active = isNavActive(item.id);
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : hasAccess
                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        : 'text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/40 opacity-70'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {!sidebarCollapsed && !hasAccess && (
                      <span className="text-[10px] text-amber-500 font-mono">kunci</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <img
              src={user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(user?.roles || [user?.role]).filter((r): r is string => Boolean(r)).slice(0, 2).map((r) => (
                    <Badge key={r} variant="blue" className="text-[8px] px-1 py-0 uppercase">
                      {r.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Mobile menu toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Buka menu admin"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs
              items={[
                { label: 'Admin', onClick: () => handleNav('admin-dashboard') },
                { label: getBreadcrumbLabel() },
              ]}
            />
          </div>

          {/* Quick Search, Role switcher, Theme toggle, Notification & Web link */}
          <div className="flex items-center gap-3">
            {/* Search Input (Global debounceable) */}
            <div className="relative hidden lg:block w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari konten atau menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onNavigate('admin-posts');
                  }
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Tenant Switcher (Multi-Tenant SaaS) */}
            <div className="relative hidden md:flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <select
                aria-label="Pilih Institusi / Tenant Aktif"
                value={activeTenant?.id || ''}
                onChange={(e) => switchTenant(e.target.value)}
                className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[190px] truncate"
              >
                {userTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher (Simulasi Cepat Hak Akses Seluruh Peran Pendidikan) */}
            <div className="relative hidden sm:block">
              <select
                aria-label="Pilih peran pengguna untuk simulasi"
                value={user?.role}
                onChange={(e) => switchUser(e.target.value as any)}
                className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[180px]"
              >
                <option value="SUPER_ADMIN">👑 Super Admin</option>
                <option value="ADMIN_SEKOLAH">🏫 Admin Sekolah</option>
                <option value="KEPALA_SEKOLAH">🎓 Kepala Sekolah</option>
                <option value="WAKIL_KEPALA_SEKOLAH">👔 Wakil Kepala Sekolah</option>
                <option value="ADMIN_AKADEMIK">📚 Admin Akademik</option>
                <option value="ADMIN_KESISWAAN">🎖️ Admin Kesiswaan</option>
                <option value="GURU">📖 Guru Mapel</option>
                <option value="WALI_KELAS">🌟 Wali Kelas</option>
                <option value="TENAGA_ADMINISTRASI">📋 Tata Usaha</option>
                <option value="BENDAHARA">💰 Bendahara</option>
                <option value="PUSTAKAWAN">📚 Pustakawan</option>
                <option value="PETUGAS_SARPRAS">🏢 Sarpras</option>
                <option value="SISWA">🎒 Siswa</option>
                <option value="ORANG_TUA">👨‍👩‍👧 Orang Tua</option>
              </select>
            </div>

            {/* Tombol Lihat Website Publik */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Kunjungi website publik"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website Publik</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Ganti Mode Terang' : 'Ganti Mode Gelap'}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                aria-label="Notifikasi Audit"
              >
                <Bell className="w-4 h-4" />
                {auditLogs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Aktivitas Sistem Terbaru
                    </span>
                    <button
                      onClick={() => handleNav('admin-audit')}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="py-2 text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {log.action}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{log.details}</p>
                        <span className="text-[9px] text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Keluar dari sesi"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3. WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-white dark:bg-slate-900 h-full flex flex-col p-4 shadow-2xl z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-sm">Nusantara CMS</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {navGroups.map((group) => (
                <div key={group.groupName} className="space-y-1">
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.groupName}
                  </div>
                  {group.items.map((item) => {
                    const active = isNavActive(item.id);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
