/**
 * Nusantara Education CMS
 * Phase 2 - Full Educational Content Management System (CMS)
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth/AuthContext';
import { ThemeProvider } from './lib/theme/ThemeContext';
import { cmsStore } from './lib/db';
import { canAccessAdminRoute, hasPermission } from './lib/permissions';
import { ActiveNav, Post, GalleryAlbum, EventItem } from './types';

// Public Components
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';
import { HomeView } from './components/public/HomeView';
import { AboutView } from './components/public/AboutView';
import { NewsView } from './components/public/NewsView';
import { NewsDetailView } from './components/public/NewsDetailView';
import { AnnouncementView } from './components/public/AnnouncementView';
import { AgendaView } from './components/public/AgendaView';
import { AgendaDetailView } from './components/public/AgendaDetailView';
import { GalleryView } from './components/public/GalleryView';
import { GalleryDetailView } from './components/public/GalleryDetailView';
import { SearchView } from './components/public/SearchView';
import { ContactView } from './components/public/ContactView';

// Auth Components
import { LoginView } from './components/auth/LoginView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ArticlesManagement } from './components/admin/ArticlesManagement';
import { NewsManagement } from './components/admin/NewsManagement';
import { ArticleEditor } from './components/admin/ArticleEditor';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { TagManagement } from './components/admin/TagManagement';
import { AnnouncementManagement } from './components/admin/AnnouncementManagement';
import { AgendaManagement } from './components/admin/AgendaManagement';
import { GalleryManagement } from './components/admin/GalleryManagement';
import { MenuManagement } from './components/admin/MenuManagement';
import { CommentsManagement } from './components/admin/CommentsManagement';
import { GlobalSeoManagement } from './components/admin/GlobalSeoManagement';
import { PagesManagement } from './components/admin/PagesManagement';
import { MediaLibrary } from './components/admin/MediaLibrary';
import { UsersManagement } from './components/admin/UsersManagement';
import { RolesManagement } from './components/admin/RolesManagement';
import { PermissionMatrix } from './components/admin/PermissionMatrix';
import { TeacherProfileManagement } from './components/admin/TeacherProfileManagement';
import { StudentProfileManagement } from './components/admin/StudentProfileManagement';
import { ParentProfileManagement } from './components/admin/ParentProfileManagement';
import { StaffProfileManagement } from './components/admin/StaffProfileManagement';
import { HomeroomManagement } from './components/admin/HomeroomManagement';
import { InvitationsManagement } from './components/admin/InvitationsManagement';
import { CsvImportExport } from './components/admin/CsvImportExport';
import { ActivityLogsView } from './components/admin/ActivityLogsView';
import { SettingsManagement } from './components/admin/SettingsManagement';
import { AuditLogView } from './components/admin/AuditLogView';
import { Forbidden403 } from './components/admin/Forbidden403';
import { InvitationAcceptView } from './components/auth/InvitationAcceptView';
import { PasswordResetView } from './components/auth/PasswordResetView';
import { RegisterInstitutionView } from './components/auth/RegisterInstitutionView';

// Phase 4 Academic & Multi-Tenant Components
import { AcademicDashboard } from './components/admin/AcademicDashboard';
import { TenantsManagement } from './components/admin/TenantsManagement';
import { SubscriptionsManagement } from './components/admin/SubscriptionsManagement';
import { InstitutionProfileView } from './components/admin/InstitutionProfileView';
import { AcademicYearsManagement } from './components/admin/AcademicYearsManagement';
import { AcademicStructureManagement } from './components/admin/AcademicStructureManagement';
import { RoomsManagement } from './components/admin/RoomsManagement';
import { SubjectsManagement } from './components/admin/SubjectsManagement';
import { CurriculumManagement } from './components/admin/CurriculumManagement';
import { TeachingAssignmentsManagement } from './components/admin/TeachingAssignmentsManagement';
import { SchedulingManagement } from './components/admin/SchedulingManagement';
import { LearningDocsManagement } from './components/admin/LearningDocsManagement';
import { AcademicCalendarManagement } from './components/admin/AcademicCalendarManagement';

// Phase 5 Attendance, Assessments, Examinations, Report Cards & Portals
import { StudentAttendanceManagement } from './components/admin/StudentAttendanceManagement';
import { StaffAttendanceManagement } from './components/admin/StaffAttendanceManagement';
import { LeaveRequestsManagement } from './components/admin/LeaveRequestsManagement';
import { AssessmentsManagement } from './components/admin/AssessmentsManagement';
import { QuestionBankManagement } from './components/admin/QuestionBankManagement';
import { ExaminationsManagement } from './components/admin/ExaminationsManagement';
import { ReportCardManagement } from './components/admin/ReportCardManagement';
import { UniversityGradesManagement } from './components/admin/UniversityGradesManagement';
import { AcademicDecisionsManagement } from './components/admin/AcademicDecisionsManagement';
import { AcademicReportsView } from './components/admin/AcademicReportsView';
import { NotificationsView } from './components/admin/NotificationsView';
import { StudentAcademicPortal } from './components/portal/StudentAcademicPortal';
import { ParentAcademicPortal } from './components/portal/ParentAcademicPortal';

import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Eye, ArrowLeft } from 'lucide-react';

function MainRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Reactive state from unified CMS store
  const [storeState, setStoreState] = useState(() => ({
    settings: cmsStore.getSettings(),
    posts: cmsStore.getPosts(),
    pages: cmsStore.getPages(),
    media: cmsStore.getMedia(),
    users: cmsStore.getUsers(),
    roles: cmsStore.getRoles(),
    categories: cmsStore.getCategories(),
    tags: cmsStore.getTags(),
    announcements: cmsStore.getAnnouncements(),
    events: cmsStore.getEvents(),
    galleryAlbums: cmsStore.getGalleryAlbums(),
    menus: cmsStore.getMenus(),
    comments: cmsStore.getComments(),
    auditLogs: cmsStore.getAuditLogs(),
    teacherProfiles: cmsStore.getTeacherProfiles(),
    studentProfiles: cmsStore.getStudentProfiles(),
    parentProfiles: cmsStore.getParentProfiles(),
    staffProfiles: cmsStore.getStaffProfiles(),
    homeroomAssignments: cmsStore.getHomeroomAssignments(),
    invitations: cmsStore.getInvitations(),
  }));

  // Active navigation & param states
  const [currentNav, setCurrentNav] = useState<ActiveNav>('home');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeAuthToken, setActiveAuthToken] = useState<string | null>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string | undefined>(undefined);
  const [editingPostId, setEditingPostId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subscribe to changes in the store
  useEffect(() => {
    const unsubscribe = cmsStore.subscribe(() => {
      setStoreState({
        settings: cmsStore.getSettings(),
        posts: cmsStore.getPosts(),
        pages: cmsStore.getPages(),
        media: cmsStore.getMedia(),
        users: cmsStore.getUsers(),
        roles: cmsStore.getRoles(),
        categories: cmsStore.getCategories(),
        tags: cmsStore.getTags(),
        announcements: cmsStore.getAnnouncements(),
        events: cmsStore.getEvents(),
        galleryAlbums: cmsStore.getGalleryAlbums(),
        menus: cmsStore.getMenus(),
        comments: cmsStore.getComments(),
        auditLogs: cmsStore.getAuditLogs(),
        teacherProfiles: cmsStore.getTeacherProfiles(),
        studentProfiles: cmsStore.getStudentProfiles(),
        parentProfiles: cmsStore.getParentProfiles(),
        staffProfiles: cmsStore.getStaffProfiles(),
        homeroomAssignments: cmsStore.getHomeroomAssignments(),
        invitations: cmsStore.getInvitations(),
      });
    });
    return unsubscribe;
  }, []);

  const handleNavigate = (nav: ActiveNav, param?: string) => {
    if (nav === 'news-detail' && param) {
      setActiveSlug(param);
    } else if (nav === 'agenda-detail' && param) {
      setActiveSlug(param);
    } else if (nav === 'gallery-detail' && param) {
      setActiveSlug(param);
    } else if (nav === 'preview-content' && param) {
      setActiveSlug(param);
    } else if (nav === 'search') {
      setSearchQuery(param || '');
    } else if (nav === 'accept-invitation' || nav === 'reset-password') {
      setActiveAuthToken(param || null);
    } else if (
      (nav === 'admin-post-edit' || nav === 'admin-news-edit') &&
      param
    ) {
      setEditingPostId(param);
    } else if (
      nav === 'admin-post-create' ||
      nav === 'admin-news-create'
    ) {
      setEditingPostId(undefined);
    }

    setCurrentNav(nav);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onNavString = (nav: string) => handleNavigate(nav as ActiveNav);

  const selectedPost: Post | undefined = activeSlug
    ? storeState.posts.find((p) => p.slug === activeSlug)
    : undefined;

  const selectedAlbum: GalleryAlbum | undefined = activeSlug
    ? storeState.galleryAlbums.find((a) => a.slug === activeSlug)
    : undefined;

  const selectedEvent: EventItem | undefined = activeSlug
    ? storeState.events.find((e) => e.slug === activeSlug)
    : undefined;

  // Cek apakah halaman ini berada di bawah rute /admin/*
  const isAdminRoute = currentNav.startsWith('admin-');

  // Proteksi Route Server & Client Otorisasi:
  // 1. Jika belum login mencoba akses /admin -> redirect ke login
  if (isAdminRoute && !isLoading && !isAuthenticated) {
    return <LoginView settings={storeState.settings} onNavigate={handleNavigate} />;
  }

  // 2. Jika sudah login tetapi tidak punya izin untuk menu target -> Tampilkan 403 Akses Ditolak
  if (isAdminRoute && !isLoading && isAuthenticated && !canAccessAdminRoute(user, currentNav)) {
    return (
      <AdminLayout
        settings={storeState.settings}
        currentNav={currentNav}
        onNavigate={handleNavigate}
        auditLogs={storeState.auditLogs}
      >
        <Forbidden403 onNavigate={handleNavigate} requiredPermission={currentNav} />
      </AdminLayout>
    );
  }

  // ===========================================================================
  // RENDER ADMIN DASHBOARD & CMS
  // ===========================================================================
  if (isAdminRoute) {
    return (
      <AdminLayout
        settings={storeState.settings}
        currentNav={currentNav}
        onNavigate={handleNavigate}
        auditLogs={storeState.auditLogs}
      >
        {currentNav === 'admin-dashboard' && (
          <DashboardOverview
            posts={storeState.posts}
            pages={storeState.pages}
            media={storeState.media}
            users={storeState.users}
            auditLogs={storeState.auditLogs}
            onNavigate={handleNavigate}
          />
        )}

        {/* Artikel Management */}
        {currentNav === 'admin-posts' && (
          <ArticlesManagement
            posts={storeState.posts}
            categories={storeState.categories}
            onNavigate={handleNavigate}
            postTypeFilter="ARTICLE"
          />
        )}

        {(currentNav === 'admin-post-create' || currentNav === 'admin-post-edit') && (
          <ArticleEditor
            postId={editingPostId}
            defaultType="ARTICLE"
            categories={storeState.categories}
            mediaList={storeState.media}
            onNavigate={handleNavigate}
          />
        )}

        {/* Warta Berita Management */}
        {currentNav === 'admin-news' && (
          <NewsManagement
            posts={storeState.posts}
            categories={storeState.categories}
            onNavigate={handleNavigate}
          />
        )}

        {(currentNav === 'admin-news-create' || currentNav === 'admin-news-edit') && (
          <ArticleEditor
            postId={editingPostId}
            defaultType="NEWS"
            categories={storeState.categories}
            mediaList={storeState.media}
            onNavigate={handleNavigate}
          />
        )}

        {/* Kategori Berjenjang */}
        {currentNav === 'admin-categories' && (
          <CategoryManagement
            categories={storeState.categories}
            onNavigate={handleNavigate}
          />
        )}

        {/* Tag Konten */}
        {currentNav === 'admin-tags' && (
          <TagManagement
            tags={storeState.tags}
            onNavigate={handleNavigate}
          />
        )}

        {/* Pengumuman Resmi */}
        {currentNav === 'admin-announcements' && (
          <AnnouncementManagement
            announcements={storeState.announcements}
            onNavigate={handleNavigate}
          />
        )}

        {/* Agenda Kegiatan */}
        {currentNav === 'admin-events' && (
          <AgendaManagement
            events={storeState.events}
            onNavigate={handleNavigate}
          />
        )}

        {/* Galeri Foto */}
        {currentNav === 'admin-gallery' && (
          <GalleryManagement
            albums={storeState.galleryAlbums}
            onNavigate={handleNavigate}
          />
        )}

        {/* Menu Navigasi Builder */}
        {currentNav === 'admin-menus' && (
          <MenuManagement
            menus={storeState.menus}
            onNavigate={handleNavigate}
          />
        )}

        {/* Moderasi Komentar */}
        {currentNav === 'admin-comments' && (
          <CommentsManagement
            comments={storeState.comments}
            onNavigate={handleNavigate}
          />
        )}

        {/* SEO Global & Sitemap */}
        {currentNav === 'admin-seo' && (
          <GlobalSeoManagement
            settings={storeState.settings}
            onNavigate={handleNavigate}
          />
        )}

        {/* Halaman Statis */}
        {currentNav === 'admin-pages' && (
          <PagesManagement
            pages={storeState.pages}
            onNavigate={handleNavigate}
          />
        )}

        {/* Pustaka Berkas & Media */}
        {currentNav === 'admin-media' && (
          <MediaLibrary media={storeState.media} />
        )}

        {/* Manajemen Pengguna */}
        {currentNav === 'admin-users' && (
          <UsersManagement
            users={storeState.users}
            roles={storeState.roles}
          />
        )}

        {/* Direktori Pendidik & Guru */}
        {currentNav === 'admin-teachers' && (
          <TeacherProfileManagement teachers={storeState.teacherProfiles} />
        )}

        {/* Buku Induk Peserta Didik (Siswa) */}
        {currentNav === 'admin-students' && (
          <StudentProfileManagement students={storeState.studentProfiles} />
        )}

        {/* Data Orang Tua & Wali Murid */}
        {currentNav === 'admin-parents' && (
          <ParentProfileManagement parents={storeState.parentProfiles} />
        )}

        {/* Tenaga Kependidikan & TU */}
        {currentNav === 'admin-staff' && (
          <StaffProfileManagement staffList={storeState.staffProfiles} />
        )}

        {/* Penugasan Wali Kelas & Rombel */}
        {currentNav === 'admin-homeroom' && (
          <HomeroomManagement assignments={storeState.homeroomAssignments} />
        )}

        {/* Role & Hak Akses (Phase 3) */}
        {currentNav === 'admin-roles' && (
          <RolesManagement
            roles={storeState.roles}
            onOpenPermissions={(roleName) => {
              setSelectedRoleForPermissions(roleName);
              handleNavigate('admin-permissions');
            }}
          />
        )}

        {/* Matriks Izin Akses Modular */}
        {currentNav === 'admin-permissions' && (
          <PermissionMatrix
            roles={storeState.roles}
            initialSelectedRole={selectedRoleForPermissions}
          />
        )}

        {/* Undangan Pengguna & Token Registrasi */}
        {currentNav === 'admin-invitations' && (
          <InvitationsManagement invitations={storeState.invitations} />
        )}

        {/* Batch Import & Export Data CSV */}
        {currentNav === 'admin-import-export' && (
          <CsvImportExport />
        )}

        {/* Log Aktivitas & Jejak Audit Sistem */}
        {currentNav === 'admin-activity-logs' && (
          <ActivityLogsView logs={storeState.auditLogs} />
        )}

        {/* Pengaturan Situs */}
        {currentNav === 'admin-settings' && (
          <SettingsManagement settings={storeState.settings} />
        )}

        {/* Audit Log */}
        {currentNav === 'admin-audit' && (
          <AuditLogView auditLogs={storeState.auditLogs} />
        )}

        {/* Phase 4: Pusat Akademik & Kurikulum */}
        {currentNav === 'admin-academic-dashboard' && (
          <AcademicDashboard onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Manajemen Multi-Tenant SaaS */}
        {currentNav === 'admin-tenants' && (
          <TenantsManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Langganan & Kuota Tenant */}
        {currentNav === 'admin-subscriptions' && (
          <SubscriptionsManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Identitas & Profil Resmi Institusi */}
        {currentNav === 'admin-institution-profile' && (
          <InstitutionProfileView onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Tahun Ajaran & Semester */}
        {currentNav === 'admin-academic-years' && (
          <AcademicYearsManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Struktur Akademik, Tingkat, Jurusan & Rombel */}
        {currentNav === 'admin-academic-structure' && (
          <AcademicStructureManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Ruangan & Sarpras */}
        {currentNav === 'admin-rooms' && (
          <RoomsManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Mata Pelajaran & Kursus */}
        {currentNav === 'admin-subjects' && (
          <SubjectsManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Kurikulum & Capaian (CP/TP) */}
        {currentNav === 'admin-curriculum' && (
          <CurriculumManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Distribusi & Beban Mengajar Guru */}
        {currentNav === 'admin-teaching-assignments' && (
          <TeachingAssignmentsManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Jadwal Pelajaran & Anti-Tabrakan */}
        {currentNav === 'admin-schedules' && (
          <SchedulingManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Perangkat Ajar (RPP, Modul, Silabus, RPS) */}
        {currentNav === 'admin-learning-docs' && (
          <LearningDocsManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 4: Kalender Akademik */}
        {currentNav === 'admin-academic-calendar' && (
          <AcademicCalendarManagement onNavigate={handleNavigate} />
        )}

        {/* Phase 5: Presensi Siswa & Rekap */}
        {currentNav === 'admin-student-attendance' && (
          <StudentAttendanceManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Presensi Guru & Staf */}
        {currentNav === 'admin-staff-attendance' && (
          <StaffAttendanceManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Izin & Cuti */}
        {currentNav === 'admin-leave-requests' && (
          <LeaveRequestsManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Penilaian, Bobot & Kunci Nilai */}
        {currentNav === 'admin-assessments' && (
          <AssessmentsManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Bank Soal & Butir Soal */}
        {currentNav === 'admin-question-bank' && (
          <QuestionBankManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Jadwal Ujian & CBT Engine */}
        {currentNav === 'admin-examinations' && (
          <ExaminationsManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Rapor Siswa & Pengesahan */}
        {currentNav === 'admin-report-cards' && (
          <ReportCardManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: KHS & Transkrip Perguruan Tinggi */}
        {currentNav === 'admin-transcripts' && (
          <UniversityGradesManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Kenaikan Kelas & Kelulusan (Sidang Pleno) */}
        {currentNav === 'admin-academic-decisions' && (
          <AcademicDecisionsManagement onNavigate={onNavString} />
        )}

        {/* Phase 5: Laporan Eksekutif & Analitik */}
        {currentNav === 'admin-academic-reports' && (
          <AcademicReportsView onNavigate={onNavString} />
        )}

        {/* Phase 5: Pusat Notifikasi */}
        {currentNav === 'admin-notifications' && (
          <NotificationsView onNavigate={onNavString} />
        )}
      </AdminLayout>
    );
  }

  // ===========================================================================
  // RENDER DEDICATED STUDENT & PARENT PORTALS
  // ===========================================================================
  if (currentNav === 'portal-student') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </button>
            <span className="text-xs font-bold text-slate-700">{storeState.settings.siteName}</span>
          </div>
          <StudentAcademicPortal onNavigate={onNavString} />
        </div>
      </div>
    );
  }

  if (currentNav === 'portal-parent') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </button>
            <span className="text-xs font-bold text-slate-700">{storeState.settings.siteName}</span>
          </div>
          <ParentAcademicPortal onNavigate={onNavString} />
        </div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER AUTHENTICATION
  // ===========================================================================
  if (currentNav === 'login') {
    return <LoginView settings={storeState.settings} onNavigate={handleNavigate} />;
  }

  if (currentNav === 'register-institution') {
    return (
      <RegisterInstitutionView
        onSuccessLogin={() => handleNavigate('admin-dashboard')}
        onNavigateHome={() => handleNavigate('home')}
      />
    );
  }

  if (currentNav === 'forgot-password') {
    return <ForgotPasswordView onNavigate={handleNavigate} />;
  }

  if (currentNav === 'accept-invitation') {
    return (
      <InvitationAcceptView
        token={activeAuthToken || 'invite-demo-token-123'}
        onSuccessLogin={() => handleNavigate('admin-dashboard')}
        onNavigateHome={() => handleNavigate('home')}
      />
    );
  }

  if (currentNav === 'reset-password') {
    return (
      <PasswordResetView
        token={activeAuthToken || 'reset-demo-token-123'}
        onNavigateLogin={() => handleNavigate('login')}
        onNavigateHome={() => handleNavigate('home')}
      />
    );
  }

  // ===========================================================================
  // RENDER PREVIEW MODE (READ-ONLY UNINDEXED)
  // ===========================================================================
  if (currentNav === 'preview-content' && selectedPost) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Preview Notice Header Bar */}
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-3 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>
              MODE PRATINJAU READ-ONLY: Konten ini berstatus "{selectedPost.status}" dan belum diindeks mesin pencari.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNavigate('admin-posts')}
            className="bg-white text-slate-900 border-none font-bold text-xs"
          >
            Tutup Pratinjau
          </Button>
        </div>

        <NewsDetailView
          post={selectedPost}
          allPosts={storeState.posts}
          settings={storeState.settings}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  // ===========================================================================
  // RENDER WEBSITE PUBLIK PENDIDIKAN
  // ===========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors">
      <PublicNavbar
        settings={storeState.settings}
        currentNav={currentNav}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {currentNav === 'home' && (
          <HomeView
            settings={storeState.settings}
            posts={storeState.posts}
            onNavigate={handleNavigate}
          />
        )}

        {currentNav === 'about' && (
          <AboutView
            settings={storeState.settings}
            pages={storeState.pages}
          />
        )}

        {/* Warta Berita */}
        {currentNav === 'news' && (
          <NewsView
            posts={storeState.posts}
            categories={storeState.categories}
            contentType="NEWS"
            onNavigate={handleNavigate}
          />
        )}

        {/* Artikel Edukasi */}
        {currentNav === 'articles' && (
          <NewsView
            posts={storeState.posts}
            categories={storeState.categories}
            contentType="ARTICLE"
            onNavigate={handleNavigate}
          />
        )}

        {currentNav === 'news-detail' && selectedPost && (
          <NewsDetailView
            post={selectedPost}
            allPosts={storeState.posts}
            settings={storeState.settings}
            onNavigate={handleNavigate}
          />
        )}

        {/* Pengumuman Resmi */}
        {currentNav === 'announcements' && (
          <AnnouncementView
            posts={storeState.posts}
            onNavigate={handleNavigate}
          />
        )}

        {/* Agenda Kegiatan */}
        {currentNav === 'agenda' && <AgendaView />}

        {currentNav === 'agenda-detail' && selectedEvent && (
          <AgendaDetailView event={selectedEvent} onNavigate={handleNavigate} />
        )}

        {/* Galeri Foto */}
        {currentNav === 'gallery' && (
          <GalleryView
            albums={storeState.galleryAlbums}
            onNavigate={handleNavigate}
          />
        )}

        {currentNav === 'gallery-detail' && selectedAlbum && (
          <GalleryDetailView album={selectedAlbum} onNavigate={handleNavigate} />
        )}

        {/* Pencarian Terpadu */}
        {currentNav === 'search' && (
          <SearchView initialQuery={searchQuery} onNavigate={handleNavigate} />
        )}

        {/* Kontak & PPDB */}
        {currentNav === 'contact' && <ContactView settings={storeState.settings} />}
      </main>

      <PublicFooter
        settings={storeState.settings}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
