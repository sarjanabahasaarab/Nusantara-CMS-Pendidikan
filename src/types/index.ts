/**
 * Nusantara Education CMS - Type Definitions
 * Phase 3 - Advanced User Management, Educational Profiles & Granular RBAC
 */

// -----------------------------------------------------------------------------
// 1. ROLES & PERMISSIONS (PHASE 3)
// -----------------------------------------------------------------------------

export type RoleName = 
  | 'SUPER_ADMIN'
  | 'ADMIN_SEKOLAH'
  | 'ADMIN' // Backward compatibility alias for ADMIN_SEKOLAH
  | 'KEPALA_SEKOLAH'
  | 'WAKIL_KEPALA_SEKOLAH'
  | 'ADMIN_AKADEMIK'
  | 'ADMIN_KESISWAAN'
  | 'GURU'
  | 'WALI_KELAS'
  | 'TENAGA_ADMINISTRASI'
  | 'BENDAHARA'
  | 'PUSTAKAWAN'
  | 'PETUGAS_SARPRAS'
  | 'SISWA'
  | 'ORANG_TUA'
  | string;

export type PermissionCode =
  // Dashboard & Sistem
  | 'dashboard.view'
  
  // Pengguna (Users)
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.import'
  | 'users.export'
  | 'users.block'
  | 'users.reset_password'

  // Role & Permission
  | 'roles.view'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'permissions.view'
  | 'permissions.manage'

  // Profil Guru & Tenaga Pendidik
  | 'teachers.view'
  | 'teachers.create'
  | 'teachers.update'
  | 'teachers.delete'

  // Profil Siswa (Students)
  | 'students.view'
  | 'students.create'
  | 'students.update'
  | 'students.delete'

  // Profil Orang Tua / Wali (Parents)
  | 'parents.view'
  | 'parents.create'
  | 'parents.update'
  | 'parents.delete'

  // Tenaga Kependidikan (Staff)
  | 'staff.view'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete'

  // Wali Kelas & Rombel
  | 'homeroom.view'
  | 'homeroom.manage'

  // Undangan Pengguna (Invitations)
  | 'invitations.create'
  | 'invitations.view'

  // Konten CMS (Artikel, Berita, Halaman, Pengumuman, Agenda, Galeri)
  | 'posts.view'
  | 'posts.create'
  | 'posts.update'
  | 'posts.delete'
  | 'posts.publish'
  | 'pages.view'
  | 'pages.create'
  | 'pages.update'
  | 'pages.delete'
  | 'announcements.manage'
  | 'events.manage'
  | 'gallery.manage'

  // Taksonomi, Media & Navigasi
  | 'categories.manage'
  | 'tags.manage'
  | 'media.view'
  | 'media.upload'
  | 'media.delete'
  | 'menus.manage'
  | 'comments.manage'

  // Pengaturan & Audit
  | 'seo.manage'
  | 'settings.view'
  | 'settings.update'
  | 'audit.view'

  // Akademik & Masa Depan
  | 'attendance.view'
  | 'attendance.mark'
  | 'grades.view'
  | 'grades.input'
  | 'grades.update'
  | 'reports.view'
  | 'schedule.view'
  | 'schedule.manage'
  | 'library.view'
  | 'library.manage'
  | 'finance.view'
  | 'finance.manage'
  | 'ppdb.view'
  | 'ppdb.manage'

  // Multi-Tenant & SaaS (Phase 4)
  | 'tenants.view'
  | 'tenants.manage'
  | 'subscriptions.manage'
  | 'institution.manage'

  // Akademik & Kurikulum (Phase 4)
  | 'academicyears.view'
  | 'academicyears.manage'
  | 'academicterms.view'
  | 'academicterms.manage'
  | 'academicstructure.view'
  | 'academicstructure.manage'
  | 'rooms.view'
  | 'rooms.manage'
  | 'curriculum.view'
  | 'curriculum.manage'
  | 'subjects.view'
  | 'subjects.manage'
  | 'teachingassignments.view'
  | 'teachingassignments.manage'
  | 'schedules.view'
  | 'schedules.manage'
  | 'learningdocs.view'
  | 'learningdocs.create'
  | 'learningdocs.update'
  | 'learningdocs.delete'
  | 'learningdocs.approve'
  | 'academiccalendar.view'
  | 'academiccalendar.manage';

export interface Permission {
  id: string;
  name: PermissionCode;
  description: string;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: RoleName;
  code: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: PermissionCode[];
  isSystem?: boolean; // System roles cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_INVITE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  image?: string;
  role: RoleName; // Primary role (backward compatible)
  roles: RoleName[]; // Multi-role support
  status: UserStatus;
  isActive: boolean; // Computed or alias for status === 'ACTIVE'
  tenantId?: string; // Active or primary institution tenant
  tenantIds?: string[]; // Multiple institution memberships
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// 2. PROFIL PENDIDIKAN (PHASE 3 & 4)
// -----------------------------------------------------------------------------

export type EmploymentStatus = 
  | 'PNS' 
  | 'PPPK' 
  | 'HONORER' 
  | 'TETAP_YAYASAN' 
  | 'TIDAK_TETAP'
  | 'KONTRAK';

export type Gender = 'L' | 'P';

export interface TeacherProfile {
  id: string;
  userId: string;
  tenantId?: string;
  nip?: string;
  nuptk?: string;
  nidn?: string; // Untuk Dosen Perguruan Tinggi
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  address: string;
  phone: string;
  email: string;
  education: 'D3' | 'S1' | 'S2' | 'S3' | 'SMA' | string;
  major: string; // Program Studi / Bidang Studi
  functionalTitle?: string; // Asisten Ahli, Lektor, Guru Muda, etc.
  employmentStatus: EmploymentStatus;
  teachingHoursPerWeek?: number;
  startDate: string;
  photo?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus = 'AKTIF' | 'PINDAH' | 'LULUS' | 'KELUAR' | 'NONAKTIF';

export interface StudentProfile {
  id: string;
  userId: string;
  tenantId?: string;
  nis: string; // Nomor Induk Siswa (wajib unik di sekolah)
  nisn?: string; // Nomor Induk Siswa Nasional (opsional / jika ada unik)
  nim?: string; // Nomor Induk Mahasiswa (untuk Perguruan Tinggi)
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  religion: string;
  address: string;
  phone?: string;
  email?: string;
  photo?: string;
  entryDate: string;
  cohortYear?: string; // e.g. "2026"
  status: StudentStatus;
  classId?: string;
  className?: string; // e.g. "X-MIPA-1", "TI-3A"
  studyProgramId?: string;
  currentSemester?: number;
  advisorTeacherId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  tenantId?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  occupation: string; // Pekerjaan
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ParentRelationship = 'AYAH' | 'IBU' | 'WALI';

export interface StudentParent {
  id: string;
  tenantId?: string;
  studentId: string;
  parentId: string;
  relationship: ParentRelationship;
  isPrimaryContact: boolean;
  canViewAcademicData: boolean;
  createdAt: string;
}

export interface StaffProfile {
  id: string;
  userId: string;
  tenantId?: string;
  employeeNumber: string; // Nomor Pegawai / NIP / NIK
  department: string; // Bagian / Unit Kerja (Tata Usaha, Keuangan, Perpustakaan, dsb.)
  position: string; // Jabatan (Tata Usaha, Operator Sekolah, Bendahara, Pustakawan, Petugas Sarpras, Laboran)
  employmentStatus: EmploymentStatus;
  startDate: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeroomAssignment {
  id: string;
  tenantId?: string;
  teacherId: string;
  teacherName?: string;
  classId: string;
  className: string;
  academicYearId: string;
  academicYearName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// 3. KEAMANAN, UNDANGAN & SESI (PHASE 3)
// -----------------------------------------------------------------------------

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface UserInvitation {
  id: string;
  email: string;
  name?: string;
  roles: RoleName[];
  token: string;
  expiresAt: string;
  status: InvitationStatus;
  invitedBy: string;
  inviterName?: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface LoginHistory {
  id: string;
  userId?: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  reason?: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// 4. PENGATURAN SITUS
// -----------------------------------------------------------------------------

export interface SiteSetting {
  id: string;
  institutionType: 'SD' | 'SMP' | 'SMA' | 'SMK' | 'PERGURUAN_TINGGI';
  siteName: string;
  tagline: string;
  description: string;
  npsn: string;
  accreditation: string;
  accreditationBody: string;
  logo: string;
  favicon: string;
  heroImage: string;

  // Sambutan Kepala Sekolah
  principalName: string;
  principalTitle: string;
  principalImage: string;
  principalQuote: string;
  principalWelcomeMessage: string;

  // Statistik Sekolah
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;

  // Visi, Misi & Filosofi
  vision: string;
  mission: string;
  educationalPhilosophy: string;

  // PPDB & Banner Pengumuman
  ppdbActive: boolean;
  ppdbNotice: string;
  ppdbCtaText: string;
  ppdbCtaUrl: string;

  // Kontak & Alamat
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHoursWeekday: string;
  workingHoursWeekend: string;
  mapsEmbedUrl?: string;

  // Media Sosial
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;

  // SEO & Footer
  metaTitle: string;
  metaDescription: string;
  footerCopyright: string;
  timezone?: string; // e.g. "Asia/Jakarta"

  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// 5. KONTEN & TAKSONOMI (PHASE 2)
// -----------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
  postCount?: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = 'ARTICLE' | 'NEWS';

export type PostStatus = 
  | 'DRAFT' 
  | 'SCHEDULED' 
  | 'PUBLISHED' 
  | 'ARCHIVED' 
  | 'TRASHED';

export type RobotsDirective = 
  | 'INDEX, FOLLOW' 
  | 'NOINDEX, FOLLOW' 
  | 'INDEX, NOFOLLOW' 
  | 'NOINDEX, NOFOLLOW';

export interface Post {
  id: string;
  type: ContentType; // ARTICLE atau NEWS
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: PostStatus;
  isFeatured?: boolean;
  authorId: string;
  authorName?: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  views?: number;
  publishedAt?: string;
  scheduledAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: RobotsDirective;
  allowIndex?: boolean;
  allowFollow?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'TRASHED';
  template?: 'default' | 'fullwidth' | 'landing';
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robots?: RobotsDirective;
  allowIndex?: boolean;
  allowFollow?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  priority: AnnouncementPriority;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  startDate?: string;
  endDate?: string;
  attachment?: string;
  attachmentName?: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  category?: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  organizer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryPhoto {
  id: string;
  albumId: string;
  mediaId?: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
  createdAt: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  photosCount?: number;
  photos?: GalleryPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface NavigationMenu {
  id: string;
  label: string;
  url: string;
  parentId?: string | null;
  target: '_self' | '_blank';
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  children?: NavigationMenu[];
  createdAt: string;
  updatedAt: string;
}

export type CommentStatus = 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASHED';

export interface Comment {
  id: string;
  contentId: string;
  contentTitle?: string;
  contentType?: ContentType;
  authorName: string;
  authorEmail: string;
  content: string;
  status: CommentStatus;
  ipAddress?: string;
  createdAt: string;
}

export type MediaTypeFilter = 'ALL' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'DOC' | 'OTHER';

export interface Media {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  altText?: string;
  caption?: string;
  uploadedBy: string;
  uploaderName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface StorageProvider {
  name: string;
  upload(file: File | { name: string; type: string; size: number; content: string }): Promise<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }>;
  delete(fileUrl: string): Promise<boolean>;
  getUrl(key: string): string;
}

export interface AuthSession {
  user: User | null;
  token?: string;
  expiresAt?: string;
}

// -----------------------------------------------------------------------------
// 6. ACTIVE NAVIGATION ROUTES
// -----------------------------------------------------------------------------

export type ActiveNav =
  // Public
  | 'home'
  | 'about'
  | 'news'
  | 'news-detail'
  | 'articles'
  | 'article-detail'
  | 'announcements'
  | 'agenda'
  | 'agenda-detail'
  | 'gallery'
  | 'gallery-detail'
  | 'search'
  | 'contact'
  | 'preview-content'
  | 'register-institution' // Public self-service institution registration
  
  // Auth
  | 'login'
  | 'forgot-password'
  | 'accept-invitation'
  | 'reset-password'
  
  // Admin Dashboard
  | 'admin-dashboard'
  
  // Admin Multi-Tenant & SaaS Platform (Phase 4)
  | 'admin-tenants'
  | 'admin-tenant-create'
  | 'admin-institution-profile'
  | 'admin-subscriptions'

  // Admin Manajemen Akademik (Phase 4)
  | 'admin-academic-dashboard'
  | 'admin-academic-years'
  | 'admin-academic-terms'
  | 'admin-academic-structure'
  | 'admin-rooms'
  | 'admin-subjects'
  | 'admin-curriculum'
  | 'admin-teaching-assignments'
  | 'admin-schedules'
  | 'admin-learning-docs'
  | 'admin-academic-calendar'
  
  // Admin Kelembagaan & Pengguna (Phase 3)
  | 'admin-users'
  | 'admin-user-create'
  | 'admin-user-detail'
  | 'admin-user-edit'
  | 'admin-teachers'
  | 'admin-students'
  | 'admin-parents'
  | 'admin-staff'
  | 'admin-homeroom'
  | 'admin-roles'
  | 'admin-role-create'
  | 'admin-permissions'
  | 'admin-invitations'
  | 'admin-import-export'
  | 'admin-activity-logs'

  // Admin Konten
  | 'admin-posts'
  | 'admin-post-create'
  | 'admin-post-edit'
  | 'admin-news'
  | 'admin-news-create'
  | 'admin-news-edit'
  | 'admin-pages'
  | 'admin-page-create'
  | 'admin-page-edit'
  | 'admin-announcements'
  | 'admin-events'
  | 'admin-gallery'
  
  // Admin Taksonomi & Navigasi
  | 'admin-categories'
  | 'admin-tags'
  | 'admin-media'
  | 'admin-menus'
  | 'admin-comments'
  
  // Admin Sistem & Pengaturan
  | 'admin-seo'
  | 'admin-settings'
  | 'admin-audit'
  | 'forbidden';

// -----------------------------------------------------------------------------
// 7. MULTI-TENANT SAAS & SISTEM AKADEMIK (PHASE 4)
// -----------------------------------------------------------------------------

export type InstitutionType = 
  | 'SD'
  | 'MI'
  | 'SMP'
  | 'MTs'
  | 'SMA'
  | 'MA'
  | 'SMK'
  | 'PERGURUAN_TINGGI'
  | 'UNIVERSITAS'
  | 'AKADEMI'
  | 'POLITEKNIK'
  | 'LAINNYA';

export type InstitutionLevel = 'K12' | 'HIGHER_ED' | 'VOCATIONAL' | 'NON_FORMAL';

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

export type TenantStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type?: InstitutionType | string;
  institutionType?: string;
  category?: string;
  subdomain?: string;
  customDomain?: string;
  bannerImage?: string;
  npsnOrCode?: string;
  educationLevel?: InstitutionLevel;
  npsn?: string;
  nisNss?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  principalName?: string;
  principalTitle?: string;
  status: TenantStatus | string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDomain {
  id: string;
  tenantId: string;
  domain: string;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  sslStatus: 'ACTIVE' | 'PENDING' | 'FAILED';
  createdAt: string;
  updatedAt?: string;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  role?: RoleName | string;
  roleCode?: string;
  roles?: RoleName[];
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantSetting {
  id: string;
  tenantId: string;
  siteName?: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  themeColor?: string;
  accentColor?: string;
  heroImage?: string;
  timezone?: string;
  currency?: string;
  currentAcademicYearId?: string;
  currentAcademicTermId?: string;
  activeAcademicYearId?: string;
  activeAcademicTermId?: string;
  currentCurriculumId?: string;
  enableStudentPortal?: boolean;
  enableParentPortal?: boolean;
  enableOnlinePPDB?: boolean;
  enableAttendanceSync?: boolean;
  defaultTimezone?: string;
  allowTeacherDocumentApproval?: boolean;
  maxUploadSizeMb?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  plan?: SubscriptionPlan | string;
  tier?: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  autoRenew?: boolean;
  maxUsers?: number;
  maxStudents?: number;
  maxStorageMb?: number;
  customDomainAllowed?: boolean;
  apiAccessAllowed?: boolean;
  whiteLabelAllowed?: boolean;
  customLimits?: {
    maxUsers?: number;
    maxStudents?: number;
    maxStorageMb?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenantUsage {
  id: string;
  tenantId: string;
  userCount?: number;
  studentCount?: number;
  teacherCount?: number;
  storageUsedMb?: number;
  postCount?: number;
  mediaCount?: number;
  recordedMonth?: string;
  updatedAt?: string;
  currentUsers?: number;
  maxUsers?: number;
  currentStudents?: number;
  maxStudents?: number;
  currentMediaStorageMb?: number;
  maxMediaStorageMb?: number;
  currentWebsites?: number;
  maxWebsites?: number;
  activeModules?: string[];
}

export type AcademicYearStatus = 'ACTIVE' | 'PLANNED' | 'CLOSED';

export interface AcademicYear {
  id: string;
  tenantId: string;
  name: string; // e.g. "2026/2027"
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  isCurrent?: boolean;
  isActive?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TermType = 'ODD' | 'EVEN' | 'SHORT' | 'SPECIAL';

export interface AcademicTerm {
  id: string;
  tenantId: string;
  academicYearId: string;
  name: string; // e.g. "Semester Ganjil", "Semester Genap", "Semester Pendek"
  termType: TermType;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  isActive?: boolean;
  status: 'ACTIVE' | 'CLOSED' | 'PLANNED' | 'UPCOMING';
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  deanName?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  tenantId: string;
  facultyId?: string;
  code: string;
  name: string;
  headName?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyProgram {
  id: string;
  tenantId: string;
  facultyId?: string;
  departmentId?: string;
  code: string;
  name: string;
  degree: 'D3' | 'D4' | 'S1' | 'S2' | 'S3' | 'SMA_IPA' | 'SMA_IPS' | 'SMK_RPL' | 'SMK_TKJ' | 'UMUM' | 'SMA' | string;
  accreditation?: string;
  headOfProgram?: string;
  headName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GradeLevel {
  id: string;
  tenantId: string;
  code: string;
  name: string; // e.g. "Kelas 10", "Kelas 11", "Tingkat 1"
  sequenceNumber?: number;
  sequence?: number;
  level?: number;
  educationLevel?: InstitutionLevel;
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicClass {
  id: string;
  tenantId: string;
  code: string;
  name: string; // e.g. "X-A", "XI-RPL-1", "TI-3A"
  gradeLevelId?: string;
  studyProgramId?: string;
  facultyId?: string;
  cohortYear?: string; // e.g. "2026"
  capacity?: number;
  maxCapacity?: number;
  currentStudents?: number;
  currentStudentsCount?: number;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  academicYearId: string;
  roomId?: string;
  defaultRoomId?: string;
  status: 'ACTIVE' | 'ARCHIVED' | string;
  createdAt: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type?: 'THEORY_CLASS' | 'LABORATORY' | 'AUDITORIUM' | 'WORKSHOP' | 'ONLINE' | string;
  roomType?: string;
  facilities?: string[] | string;
  isActive?: boolean;
  isAvailable?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SubjectGroup = 
  | 'UMUM_A' 
  | 'UMUM_B' 
  | 'PEMINATAN' 
  | 'KEJURUAN' 
  | 'MUATAN_LOKAL' 
  | 'MATA_KULIAH_WAJIB' 
  | 'MATA_KULIAH_PRODI' 
  | 'MATA_KULIAH_PILIHAN';

export interface Subject {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  group?: SubjectGroup;
  category?: string;
  gradeLevelId?: string;
  studyProgramId?: string;
  credits?: number; // SKS (untuk perguruan tinggi)
  creditHours?: number;
  hoursPerWeek?: number; // Alokasi jam pelajaran (untuk sekolah)
  passingGrade?: number; // KKM / Nilai batas kelulusan
  minPassingGrade?: number;
  status?: 'ACTIVE' | 'INACTIVE' | string;
  isActive?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CurriculumType = 'MERDEKA' | 'K13' | 'HIGHER_ED_OBE' | 'CUSTOM' | 'OBE';

export interface Curriculum {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type?: CurriculumType | string;
  curriculumType?: string;
  versionYear?: number;
  academicYearStart?: string;
  educationLevel?: InstitutionLevel;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | string;
  isActive?: boolean;
  description?: string;
  learningOutcomes?: any[];
  totalSubjectsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CurriculumSubject {
  id: string;
  tenantId?: string;
  curriculumId: string;
  subjectId: string;
  subjectName?: string;
  gradeLevelId?: string;
  gradeLevelCode?: string;
  semesterNumber?: number;
  allocatedHours?: number;
  hoursPerWeek?: number;
  credits?: number;
  isCompulsory: boolean;
  learningOutcomes?: string; // Capaian Pembelajaran (CP)
  learningObjectives?: string;
  createdAt?: string;
}

export interface TeachingAssignment {
  id: string;
  tenantId: string;
  academicYearId: string;
  academicTermId?: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  hoursPerWeek: number;
  status?: 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED' | string;
  isCoordinator?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ScheduleType = 'REGULAR' | 'MAKEUP' | 'EXAM';

export interface ScheduleItem {
  id: string;
  tenantId: string;
  academicYearId: string;
  academicTermId: string;
  dayOfWeek: number; // 1 = Senin, 2 = Selasa, ..., 7 = Minggu
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "09:00"
  timeSlotIndex?: number;
  teachingAssignmentId?: string;
  teacherId: string;
  teacherName?: string;
  subjectId: string;
  subjectName?: string;
  classId: string;
  className?: string;
  roomId?: string;
  roomName?: string;
  roomCode?: string;
  type?: ScheduleType;
  notes?: string;
  sessionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type LearningDocType = 'SILABUS' | 'RPP' | 'MODUL_AJAR' | 'RPS';
export type LearningDocStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REVISION';

export interface LearningDocument {
  id: string;
  tenantId: string;
  type?: LearningDocType;
  documentType?: string;
  title: string;
  gradeLevel?: string;
  version?: number;
  curriculumCode?: string;
  teacherId?: string;
  teacherName?: string;
  authorId?: string;
  authorName?: string;
  subjectId: string;
  subjectName?: string;
  classId?: string;
  className?: string;
  academicYearId: string;
  semesterId?: string;
  summary?: string;
  description?: string;
  content?: string;
  learningObjectives?: string; // Tujuan Pembelajaran (TP)
  learningOutcomes?: string;   // Capaian Pembelajaran (CP)
  materials?: string;          // Materi Pembelajaran
  teachingMethods?: string;    // Metode & Pendekatan
  activities?: string;         // Langkah Kegiatan Pembelajaran
  mediaResources?: string;     // Media, Alat, Bahan
  assessmentMethods?: string;  // Teknik & Rubrik Asesmen
  references?: string;         // Sumber Referensi
  fileUrl?: string;            // Dokumen PDF/Docx
  status: LearningDocStatus;
  reviewedBy?: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  reviewNotes?: string;
  revisionNotes?: string;
  feedbackNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AcademicCalendarCategory = 
  | 'FIRST_DAY' 
  | 'ORIENTATION' 
  | 'EXAM' 
  | 'SEMESTER_BREAK' 
  | 'HOLIDAY' 
  | 'SCHOOL_EVENT' 
  | 'REPORT_DAY' 
  | 'GRADUATION' 
  | 'PPDB' 
  | 'CEREMONY'
  | 'SPECIAL';

export interface AcademicCalendarEvent {
  id: string;
  tenantId: string;
  academicYearId: string;
  title: string;
  description?: string;
  category: AcademicCalendarCategory;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  isAllDay?: boolean;
  isHoliday?: boolean;
  targetAudience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | string;
  location?: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}
