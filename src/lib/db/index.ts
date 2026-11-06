/**
 * Nusantara Education CMS - Client & Server Unified Store
 * Phase 3 - Advanced User Management, Educational Profiles & Granular RBAC
 * Menjamin integritas relasional, audit trail, soft-delete, dan persistensi state
 */

import {
  AuditLog,
  Category,
  Media,
  Page,
  Post,
  Role,
  SiteSetting,
  User,
  Tag,
  Announcement,
  EventItem,
  GalleryAlbum,
  GalleryPhoto,
  NavigationMenu,
  Comment,
  ContentType,
  PostStatus,
  CommentStatus,
  MediaTypeFilter,
  RoleName,
  PermissionCode,
  TeacherProfile,
  StudentProfile,
  ParentProfile,
  StudentParent,
  StaffProfile,
  HomeroomAssignment,
  UserInvitation,
  PasswordResetToken,
  LoginHistory,
  Tenant,
  TenantDomain,
  TenantMembership,
  TenantSetting,
  TenantSubscription,
  TenantUsage,
  AcademicYear,
  AcademicTerm,
  Faculty,
  Department,
  StudyProgram,
  GradeLevel,
  AcademicClass,
  Room,
  Subject,
  Curriculum,
  CurriculumSubject,
  TeachingAssignment,
  ScheduleItem,
  LearningDocument,
  AcademicCalendarEvent,
} from '../../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_MEDIA,
  INITIAL_PAGES,
  INITIAL_POSTS,
  INITIAL_ROLES,
  INITIAL_SITE_SETTINGS,
  INITIAL_USERS,
  INITIAL_TAGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_GALLERY_ALBUMS,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_MENUS,
  INITIAL_COMMENTS,
  INITIAL_TEACHER_PROFILES,
  INITIAL_STUDENT_PROFILES,
  INITIAL_PARENT_PROFILES,
  INITIAL_STUDENT_PARENTS,
  INITIAL_STAFF_PROFILES,
  INITIAL_HOMEROOM_ASSIGNMENTS,
  INITIAL_INVITATIONS,
  INITIAL_LOGIN_HISTORIES,
  INITIAL_TENANTS,
  INITIAL_TENANT_DOMAINS,
  INITIAL_TENANT_MEMBERSHIPS,
  INITIAL_TENANT_SETTINGS,
  INITIAL_TENANT_SUBSCRIPTIONS,
  INITIAL_TENANT_USAGES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_ACADEMIC_TERMS,
  INITIAL_FACULTIES,
  INITIAL_DEPARTMENTS,
  INITIAL_STUDY_PROGRAMS,
  INITIAL_GRADE_LEVELS,
  INITIAL_ROOMS,
  INITIAL_ACADEMIC_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_CURRICULUMS,
  INITIAL_CURRICULUM_SUBJECTS,
  INITIAL_TEACHING_ASSIGNMENTS,
  INITIAL_SCHEDULE_ITEMS,
  INITIAL_LEARNING_DOCUMENTS,
  INITIAL_ACADEMIC_CALENDAR_EVENTS,
} from './initialData';
import { generateId, slugify } from '../utils';

const STORAGE_KEY = 'nusantara_cms_db_v4';

interface CmsDataState {
  settings: SiteSetting;
  users: User[];
  roles: Role[];
  categories: Category[];
  tags: Tag[];
  posts: Post[];
  pages: Page[];
  announcements: Announcement[];
  events: EventItem[];
  galleryAlbums: GalleryAlbum[];
  galleryPhotos: GalleryPhoto[];
  menus: NavigationMenu[];
  comments: Comment[];
  media: Media[];
  auditLogs: AuditLog[];
  // Phase 3 State
  teacherProfiles: TeacherProfile[];
  studentProfiles: StudentProfile[];
  parentProfiles: ParentProfile[];
  studentParents: StudentParent[];
  staffProfiles: StaffProfile[];
  homeroomAssignments: HomeroomAssignment[];
  invitations: UserInvitation[];
  loginHistories: LoginHistory[];
  passwordResetTokens: PasswordResetToken[];
  // Phase 4 Multi-Tenant & Academic State
  activeTenantId: string;
  tenants: Tenant[];
  tenantDomains: TenantDomain[];
  tenantMemberships: TenantMembership[];
  tenantSettings: TenantSetting[];
  tenantSubscriptions: TenantSubscription[];
  tenantUsages: TenantUsage[];
  academicYears: AcademicYear[];
  academicTerms: AcademicTerm[];
  faculties: Faculty[];
  departments: Department[];
  studyPrograms: StudyProgram[];
  gradeLevels: GradeLevel[];
  academicClasses: AcademicClass[];
  rooms: Room[];
  subjects: Subject[];
  curriculums: Curriculum[];
  curriculumSubjects: CurriculumSubject[];
  teachingAssignments: TeachingAssignment[];
  scheduleItems: ScheduleItem[];
  learningDocuments: LearningDocument[];
  academicCalendarEvents: AcademicCalendarEvent[];
}

class CmsStore {
  private state: CmsDataState;
  private listeners: Set<() => void> = new Set();
  private viewedSlugsThisSession: Set<string> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): CmsDataState {
    const defaultState: CmsDataState = {
      settings: { ...INITIAL_SITE_SETTINGS },
      users: [...INITIAL_USERS],
      roles: [...INITIAL_ROLES],
      categories: [...INITIAL_CATEGORIES],
      tags: [...INITIAL_TAGS],
      posts: [...INITIAL_POSTS],
      pages: [...INITIAL_PAGES],
      announcements: [...INITIAL_ANNOUNCEMENTS],
      events: [...INITIAL_EVENTS],
      galleryAlbums: [...INITIAL_GALLERY_ALBUMS],
      galleryPhotos: [...INITIAL_GALLERY_PHOTOS],
      menus: [...INITIAL_MENUS],
      comments: [...INITIAL_COMMENTS],
      media: [...INITIAL_MEDIA],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      teacherProfiles: [...INITIAL_TEACHER_PROFILES],
      studentProfiles: [...INITIAL_STUDENT_PROFILES],
      parentProfiles: [...INITIAL_PARENT_PROFILES],
      studentParents: [...INITIAL_STUDENT_PARENTS],
      staffProfiles: [...INITIAL_STAFF_PROFILES],
      homeroomAssignments: [...INITIAL_HOMEROOM_ASSIGNMENTS],
      invitations: [...INITIAL_INVITATIONS],
      loginHistories: [...INITIAL_LOGIN_HISTORIES],
      passwordResetTokens: [],
      // Phase 4 defaults
      activeTenantId: 'tenant-sman-nusantara',
      tenants: [...INITIAL_TENANTS],
      tenantDomains: [...INITIAL_TENANT_DOMAINS],
      tenantMemberships: [...INITIAL_TENANT_MEMBERSHIPS],
      tenantSettings: [...INITIAL_TENANT_SETTINGS],
      tenantSubscriptions: [...INITIAL_TENANT_SUBSCRIPTIONS],
      tenantUsages: [...INITIAL_TENANT_USAGES],
      academicYears: [...INITIAL_ACADEMIC_YEARS],
      academicTerms: [...INITIAL_ACADEMIC_TERMS],
      faculties: [...INITIAL_FACULTIES],
      departments: [...INITIAL_DEPARTMENTS],
      studyPrograms: [...INITIAL_STUDY_PROGRAMS],
      gradeLevels: [...INITIAL_GRADE_LEVELS],
      academicClasses: [...INITIAL_ACADEMIC_CLASSES],
      rooms: [...INITIAL_ROOMS],
      subjects: [...INITIAL_SUBJECTS],
      curriculums: [...INITIAL_CURRICULUMS],
      curriculumSubjects: [...INITIAL_CURRICULUM_SUBJECTS],
      teachingAssignments: [...INITIAL_TEACHING_ASSIGNMENTS],
      scheduleItems: [...INITIAL_SCHEDULE_ITEMS],
      learningDocuments: [...INITIAL_LEARNING_DOCUMENTS],
      academicCalendarEvents: [...INITIAL_ACADEMIC_CALENDAR_EVENTS],
    };

    if (typeof window === 'undefined') {
      return defaultState;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          settings: parsed.settings || defaultState.settings,
          users: parsed.users || defaultState.users,
          roles: parsed.roles || defaultState.roles,
          categories: parsed.categories || defaultState.categories,
          tags: parsed.tags || defaultState.tags,
          posts: parsed.posts || defaultState.posts,
          pages: parsed.pages || defaultState.pages,
          announcements: parsed.announcements || defaultState.announcements,
          events: parsed.events || defaultState.events,
          galleryAlbums: parsed.galleryAlbums || defaultState.galleryAlbums,
          galleryPhotos: parsed.galleryPhotos || defaultState.galleryPhotos,
          menus: parsed.menus || defaultState.menus,
          comments: parsed.comments || defaultState.comments,
          media: parsed.media || defaultState.media,
          auditLogs: parsed.auditLogs || defaultState.auditLogs,
          teacherProfiles: parsed.teacherProfiles || defaultState.teacherProfiles,
          studentProfiles: parsed.studentProfiles || defaultState.studentProfiles,
          parentProfiles: parsed.parentProfiles || defaultState.parentProfiles,
          studentParents: parsed.studentParents || defaultState.studentParents,
          staffProfiles: parsed.staffProfiles || defaultState.staffProfiles,
          homeroomAssignments: parsed.homeroomAssignments || defaultState.homeroomAssignments,
          invitations: parsed.invitations || defaultState.invitations,
          loginHistories: parsed.loginHistories || defaultState.loginHistories,
          passwordResetTokens: parsed.passwordResetTokens || defaultState.passwordResetTokens,
          // Phase 4 saved state
          activeTenantId: parsed.activeTenantId || defaultState.activeTenantId,
          tenants: parsed.tenants && parsed.tenants.length > 0 ? parsed.tenants : defaultState.tenants,
          tenantDomains: parsed.tenantDomains || defaultState.tenantDomains,
          tenantMemberships: parsed.tenantMemberships || defaultState.tenantMemberships,
          tenantSettings: parsed.tenantSettings || defaultState.tenantSettings,
          tenantSubscriptions: parsed.tenantSubscriptions || defaultState.tenantSubscriptions,
          tenantUsages: parsed.tenantUsages || defaultState.tenantUsages,
          academicYears: parsed.academicYears && parsed.academicYears.length > 0 ? parsed.academicYears : defaultState.academicYears,
          academicTerms: parsed.academicTerms && parsed.academicTerms.length > 0 ? parsed.academicTerms : defaultState.academicTerms,
          faculties: parsed.faculties || defaultState.faculties,
          departments: parsed.departments || defaultState.departments,
          studyPrograms: parsed.studyPrograms || defaultState.studyPrograms,
          gradeLevels: parsed.gradeLevels || defaultState.gradeLevels,
          academicClasses: parsed.academicClasses || defaultState.academicClasses,
          rooms: parsed.rooms || defaultState.rooms,
          subjects: parsed.subjects || defaultState.subjects,
          curriculums: parsed.curriculums || defaultState.curriculums,
          curriculumSubjects: parsed.curriculumSubjects || defaultState.curriculumSubjects,
          teachingAssignments: parsed.teachingAssignments || defaultState.teachingAssignments,
          scheduleItems: parsed.scheduleItems || defaultState.scheduleItems,
          learningDocuments: parsed.learningDocuments || defaultState.learningDocuments,
          academicCalendarEvents: parsed.academicCalendarEvents || defaultState.academicCalendarEvents,
        };
      }
    } catch (e) {
      console.warn('Gagal memuat cache CMS lokal, menggunakan data inisialisasi default');
    }

    return defaultState;
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Penyimpanan lokal penuh atau tidak diizinkan:', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // ===========================================================================
  // AUDIT LOG
  // ===========================================================================
  public addAuditLog(params: {
    userId?: string;
    userName?: string;
    userRole?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: string;
  }) {
    const newLog: AuditLog = {
      id: generateId('log'),
      userId: params.userId,
      userName: params.userName || 'Sistem',
      userRole: params.userRole || 'SYSTEM',
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details,
      ipAddress: '192.168.1.10',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server Agent',
      createdAt: new Date().toISOString(),
    };

    this.state.auditLogs = [newLog, ...this.state.auditLogs].slice(0, 300);
    this.saveState();
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs];
  }

  // ===========================================================================
  // SETTINGS
  // ===========================================================================
  public getSettings(): SiteSetting {
    return { ...this.state.settings };
  }

  public updateSettings(newSettings: Partial<SiteSetting>, user?: User | null) {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'SETTINGS_UPDATE',
      entity: 'SETTINGS',
      entityId: 'default',
      details: `Memperbarui konfigurasi situs: ${this.state.settings.siteName}`,
    });

    this.saveState();
    return this.state.settings;
  }

  // ===========================================================================
  // POSTS (ARTIKEL & BERITA UNIFIED)
  // ===========================================================================
  public getPosts(): Post[] {
    return [...this.state.posts];
  }

  /**
   * Publik konten: Hanya status 'PUBLISHED' dan jika terjadwal (scheduledAt),
   * jadwalnya sudah lewat atau sama dengan waktu sekarang.
   */
  public getPublicPosts(type?: ContentType): Post[] {
    const now = new Date();
    return this.state.posts.filter((p) => {
      if (type && p.type !== type) return false;
      if (p.status === 'TRASHED' || p.status === 'DRAFT') return false;
      if (p.status === 'SCHEDULED') {
        if (!p.scheduledAt) return false;
        const sched = new Date(p.scheduledAt);
        if (sched > now) return false;
      }
      return true;
    });
  }

  public getFeaturedPosts(): Post[] {
    return this.getPublicPosts().filter((p) => p.isFeatured);
  }

  public getPostBySlug(slug: string): Post | undefined {
    return this.state.posts.find((p) => p.slug === slug);
  }

  public getPostById(id: string): Post | undefined {
    return this.state.posts.find((p) => p.id === id);
  }

  public incrementViewCount(slug: string) {
    if (this.viewedSlugsThisSession.has(slug)) return;
    this.viewedSlugsThisSession.add(slug);

    const post = this.state.posts.find((p) => p.slug === slug);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.saveState();
    }
  }

  public createPost(
    postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): Post {
    let finalSlug = postData.slug?.trim() ? slugify(postData.slug) : slugify(postData.title);
    let counter = 1;
    let testSlug = finalSlug;
    while (this.state.posts.some((p) => p.slug === testSlug)) {
      testSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newPost: Post = {
      ...postData,
      id: generateId('post'),
      slug: testSlug,
      type: postData.type || 'ARTICLE',
      status: postData.status || 'DRAFT',
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (newPost.status === 'PUBLISHED' && !newPost.publishedAt) {
      newPost.publishedAt = now;
    }

    this.state.posts = [newPost, ...this.state.posts];
    this.recalculateCategoryAndTagCounts();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_CREATE',
      entity: 'POST',
      entityId: newPost.id,
      details: `Menulis ${newPost.type === 'NEWS' ? 'berita' : 'artikel'}: "${newPost.title}" (${newPost.status})`,
    });

    this.saveState();
    return newPost;
  }

  public updatePost(
    id: string,
    postData: Partial<Post>,
    user?: User | null
  ): Post | null {
    const index = this.state.posts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.state.posts[index];
    let finalSlug = current.slug;

    if (postData.slug && postData.slug !== current.slug) {
      finalSlug = slugify(postData.slug);
      let counter = 1;
      let testSlug = finalSlug;
      while (this.state.posts.some((p) => p.slug === testSlug && p.id !== id)) {
        testSlug = `${finalSlug}-${counter}`;
        counter++;
      }
      finalSlug = testSlug;
    }

    const now = new Date().toISOString();
    let publishedAt = postData.publishedAt ?? current.publishedAt;
    if (postData.status === 'PUBLISHED' && current.status !== 'PUBLISHED' && !publishedAt) {
      publishedAt = now;
    }

    const updated: Post = {
      ...current,
      ...postData,
      slug: finalSlug,
      publishedAt,
      updatedAt: now,
    };

    this.state.posts[index] = updated;
    this.recalculateCategoryAndTagCounts();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_UPDATE',
      entity: 'POST',
      entityId: updated.id,
      details: `Memperbarui ${updated.type === 'NEWS' ? 'berita' : 'artikel'}: "${updated.title}" [Status: ${updated.status}]`,
    });

    this.saveState();
    return updated;
  }

  public trashPost(id: string, user?: User | null): boolean {
    const post = this.state.posts.find((p) => p.id === id);
    if (!post) return false;

    post.status = 'TRASHED';
    post.deletedAt = new Date().toISOString();
    post.updatedAt = new Date().toISOString();

    this.recalculateCategoryAndTagCounts();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_TRASH',
      entity: 'POST',
      entityId: post.id,
      details: `Memindahkan ke tong sampah: "${post.title}"`,
    });

    this.saveState();
    return true;
  }

  public restorePost(id: string, user?: User | null): boolean {
    const post = this.state.posts.find((p) => p.id === id);
    if (!post) return false;

    post.status = post.publishedAt ? 'PUBLISHED' : 'DRAFT';
    post.deletedAt = undefined;
    post.updatedAt = new Date().toISOString();

    this.recalculateCategoryAndTagCounts();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_RESTORE',
      entity: 'POST',
      entityId: post.id,
      details: `Memulihkan konten dari tong sampah: "${post.title}"`,
    });

    this.saveState();
    return true;
  }

  public permanentDeletePost(id: string, user?: User | null): boolean {
    const post = this.state.posts.find((p) => p.id === id);
    if (!post) return false;

    this.state.posts = this.state.posts.filter((p) => p.id !== id);
    this.recalculateCategoryAndTagCounts();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_PERMANENT_DELETE',
      entity: 'POST',
      entityId: id,
      details: `Menghapus permanen: "${post.title}"`,
    });

    this.saveState();
    return true;
  }

  // Bulk Actions
  public bulkUpdateStatus(ids: string[], status: PostStatus, user?: User | null): number {
    let count = 0;
    const now = new Date().toISOString();
    this.state.posts = this.state.posts.map((p) => {
      if (ids.includes(p.id)) {
        count++;
        return {
          ...p,
          status,
          deletedAt: status === 'TRASHED' ? now : undefined,
          publishedAt: status === 'PUBLISHED' && !p.publishedAt ? now : p.publishedAt,
          updatedAt: now,
        };
      }
      return p;
    });

    this.recalculateCategoryAndTagCounts();
    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_BULK_STATUS',
      entity: 'POST',
      details: `Mengubah status massal ${count} konten menjadi ${status}`,
    });

    this.saveState();
    return count;
  }

  public bulkUpdateCategory(ids: string[], categoryId: string, user?: User | null): number {
    const category = this.state.categories.find((c) => c.id === categoryId);
    let count = 0;
    const now = new Date().toISOString();

    this.state.posts = this.state.posts.map((p) => {
      if (ids.includes(p.id)) {
        count++;
        return {
          ...p,
          categoryId,
          categoryName: category?.name,
          updatedAt: now,
        };
      }
      return p;
    });

    this.recalculateCategoryAndTagCounts();
    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_BULK_CATEGORY',
      entity: 'POST',
      details: `Memindahkan kategori massal ${count} konten ke "${category?.name || categoryId}"`,
    });

    this.saveState();
    return count;
  }

  public bulkTrashPosts(ids: string[], user?: User | null): number {
    return this.bulkUpdateStatus(ids, 'TRASHED', user);
  }

  public bulkDeletePosts(ids: string[], user?: User | null): number {
    const initialLen = this.state.posts.length;
    this.state.posts = this.state.posts.filter((p) => !ids.includes(p.id));
    const count = initialLen - this.state.posts.length;

    this.recalculateCategoryAndTagCounts();
    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'POST_BULK_DELETE',
      entity: 'POST',
      details: `Menghapus permanen massal ${count} konten`,
    });

    this.saveState();
    return count;
  }

  // ===========================================================================
  // CATEGORIES (HIERARCHICAL & CYCLE PREVENTED)
  // ===========================================================================
  public getCategories(): Category[] {
    return [...this.state.categories];
  }

  public getCategoryById(id: string): Category | undefined {
    return this.state.categories.find((c) => c.id === id);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.state.categories.find((c) => c.slug === slug);
  }

  /**
   * Memastikan parent category tidak menyebabkan infinite loop/circular dependency
   */
  public validateNoParentCycle(categoryId: string, candidateParentId: string | null): boolean {
    if (!candidateParentId) return true;
    if (categoryId === candidateParentId) return false;

    let currentParentId: string | null | undefined = candidateParentId;
    const visited = new Set<string>([categoryId]);

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        return false; // Ada cycle!
      }
      visited.add(currentParentId);
      const parent = this.state.categories.find((c) => c.id === currentParentId);
      currentParentId = parent?.parentId;
    }

    return true;
  }

  public createCategory(
    catData: Omit<Category, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): Category {
    let finalSlug = catData.slug?.trim() ? slugify(catData.slug) : slugify(catData.name);
    let counter = 1;
    let testSlug = finalSlug;
    while (this.state.categories.some((c) => c.slug === testSlug)) {
      testSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const parent = catData.parentId ? this.state.categories.find((c) => c.id === catData.parentId) : undefined;
    const now = new Date().toISOString();

    const newCategory: Category = {
      ...catData,
      id: generateId('cat'),
      slug: testSlug,
      parentName: parent?.name,
      postCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.state.categories = [...this.state.categories, newCategory];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'CATEGORY_CREATE',
      entity: 'CATEGORY',
      entityId: newCategory.id,
      details: `Menambahkan kategori baru: "${newCategory.name}" (Parent: ${parent?.name || 'Utama'})`,
    });

    this.saveState();
    return newCategory;
  }

  public updateCategory(
    id: string,
    catData: Partial<Category>,
    user?: User | null
  ): Category | null {
    const index = this.state.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const current = this.state.categories[index];

    // Cek circular dependency jika parentId diubah
    if (catData.parentId !== undefined && catData.parentId !== current.parentId) {
      if (!this.validateNoParentCycle(id, catData.parentId || null)) {
        throw new Error('Tidak dapat memilih kategori turunan sebagai induk (siklus terdeteksi).');
      }
    }

    let finalSlug = current.slug;
    if (catData.slug && catData.slug !== current.slug) {
      finalSlug = slugify(catData.slug);
      let counter = 1;
      let testSlug = finalSlug;
      while (this.state.categories.some((c) => c.slug === testSlug && c.id !== id)) {
        testSlug = `${finalSlug}-${counter}`;
        counter++;
      }
      finalSlug = testSlug;
    }

    const parent = catData.parentId ? this.state.categories.find((c) => c.id === catData.parentId) : undefined;
    const now = new Date().toISOString();

    const updated: Category = {
      ...current,
      ...catData,
      slug: finalSlug,
      parentName: parent?.name ?? (catData.parentId === null ? undefined : current.parentName),
      updatedAt: now,
    };

    this.state.categories[index] = updated;

    // Sinkronkan nama kategori di post
    this.state.posts = this.state.posts.map((p) => {
      if (p.categoryId === id) {
        return { ...p, categoryName: updated.name };
      }
      return p;
    });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'CATEGORY_UPDATE',
      entity: 'CATEGORY',
      entityId: updated.id,
      details: `Memperbarui kategori: "${updated.name}"`,
    });

    this.saveState();
    return updated;
  }

  public deleteCategory(id: string, user?: User | null): boolean {
    const category = this.state.categories.find((c) => c.id === id);
    if (!category) return false;

    // Reset parentId bagi anak-anak kategori ini agar tidak orphan
    this.state.categories = this.state.categories.map((c) => {
      if (c.parentId === id) {
        return { ...c, parentId: category.parentId || null, parentName: category.parentName };
      }
      return c;
    });

    // Reset categoryId di postingan
    this.state.posts = this.state.posts.map((p) => {
      if (p.categoryId === id) {
        return { ...p, categoryId: undefined, categoryName: undefined };
      }
      return p;
    });

    this.state.categories = this.state.categories.filter((c) => c.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'CATEGORY_DELETE',
      entity: 'CATEGORY',
      entityId: id,
      details: `Menghapus kategori: "${category.name}"`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // TAGS
  // ===========================================================================
  public getTags(): Tag[] {
    return [...this.state.tags];
  }

  public getTagById(id: string): Tag | undefined {
    return this.state.tags.find((t) => t.id === id);
  }

  public getTagBySlug(slug: string): Tag | undefined {
    return this.state.tags.find((t) => t.slug === slug);
  }

  public createTag(
    tagData: Omit<Tag, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): Tag {
    let finalSlug = tagData.slug?.trim() ? slugify(tagData.slug) : slugify(tagData.name);
    let counter = 1;
    let testSlug = finalSlug;
    while (this.state.tags.some((t) => t.slug === testSlug)) {
      testSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newTag: Tag = {
      ...tagData,
      id: generateId('tag'),
      slug: testSlug,
      postCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.state.tags = [...this.state.tags, newTag];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TAG_CREATE',
      entity: 'TAG',
      entityId: newTag.id,
      details: `Membuat tag: "${newTag.name}"`,
    });

    this.saveState();
    return newTag;
  }

  public updateTag(id: string, tagData: Partial<Tag>, user?: User | null): Tag | null {
    const index = this.state.tags.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = this.state.tags[index];
    const now = new Date().toISOString();
    const updated: Tag = {
      ...current,
      ...tagData,
      updatedAt: now,
    };

    // Update tags array in posts if name changed
    if (tagData.name && tagData.name !== current.name) {
      this.state.posts = this.state.posts.map((p) => {
        if (p.tags?.includes(current.name)) {
          return {
            ...p,
            tags: p.tags.map((t) => (t === current.name ? updated.name : t)),
          };
        }
        return p;
      });
    }

    this.state.tags[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TAG_UPDATE',
      entity: 'TAG',
      entityId: updated.id,
      details: `Memperbarui tag: "${updated.name}"`,
    });

    this.saveState();
    return updated;
  }

  public deleteTag(id: string, user?: User | null): boolean {
    const tag = this.state.tags.find((t) => t.id === id);
    if (!tag) return false;

    // Hapus dari postingan
    this.state.posts = this.state.posts.map((p) => {
      if (p.tags?.includes(tag.name)) {
        return {
          ...p,
          tags: p.tags.filter((t) => t !== tag.name),
        };
      }
      return p;
    });

    this.state.tags = this.state.tags.filter((t) => t.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TAG_DELETE',
      entity: 'TAG',
      entityId: id,
      details: `Menghapus tag: "${tag.name}"`,
    });

    this.saveState();
    return true;
  }

  private recalculateCategoryAndTagCounts() {
    const activePosts = this.state.posts.filter((p) => p.status !== 'TRASHED');

    // Update category counts
    this.state.categories = this.state.categories.map((c) => {
      const count = activePosts.filter((p) => p.categoryId === c.id).length;
      return { ...c, postCount: count };
    });

    // Update tag counts
    this.state.tags = this.state.tags.map((t) => {
      const count = activePosts.filter((p) => p.tags?.includes(t.name)).length;
      return { ...t, postCount: count };
    });
  }

  // ===========================================================================
  // ANNOUNCEMENTS
  // ===========================================================================
  public getAnnouncements(): Announcement[] {
    return [...this.state.announcements];
  }

  public getActiveAnnouncements(): Announcement[] {
    return this.state.announcements.filter((a) => a.status === 'PUBLISHED');
  }

  public getAnnouncementBySlug(slug: string): Announcement | undefined {
    return this.state.announcements.find((a) => a.slug === slug);
  }

  public createAnnouncement(
    data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): Announcement {
    let finalSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
    let counter = 1;
    let testSlug = finalSlug;
    while (this.state.announcements.some((a) => a.slug === testSlug)) {
      testSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newAnn: Announcement = {
      ...data,
      id: generateId('ann'),
      slug: testSlug,
      createdAt: now,
      updatedAt: now,
    };

    this.state.announcements = [newAnn, ...this.state.announcements];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ANNOUNCEMENT_CREATE',
      entity: 'ANNOUNCEMENT',
      entityId: newAnn.id,
      details: `Membuat pengumuman [${newAnn.priority}]: "${newAnn.title}"`,
    });

    this.saveState();
    return newAnn;
  }

  public updateAnnouncement(
    id: string,
    data: Partial<Announcement>,
    user?: User | null
  ): Announcement | null {
    const index = this.state.announcements.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = this.state.announcements[index];
    const now = new Date().toISOString();
    const updated: Announcement = {
      ...current,
      ...data,
      updatedAt: now,
    };

    this.state.announcements[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ANNOUNCEMENT_UPDATE',
      entity: 'ANNOUNCEMENT',
      entityId: updated.id,
      details: `Memperbarui pengumuman: "${updated.title}"`,
    });

    this.saveState();
    return updated;
  }

  public deleteAnnouncement(id: string, user?: User | null): boolean {
    const ann = this.state.announcements.find((a) => a.id === id);
    if (!ann) return false;

    this.state.announcements = this.state.announcements.filter((a) => a.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ANNOUNCEMENT_DELETE',
      entity: 'ANNOUNCEMENT',
      entityId: id,
      details: `Menghapus pengumuman: "${ann.title}"`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // EVENTS (AGENDA)
  // ===========================================================================
  public getEvents(): EventItem[] {
    return [...this.state.events];
  }

  public getUpcomingEvents(): EventItem[] {
    return this.state.events
      .filter((e) => e.status === 'PUBLISHED')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  public getEventBySlug(slug: string): EventItem | undefined {
    return this.state.events.find((e) => e.slug === slug);
  }

  public createEvent(
    data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): EventItem {
    let finalSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
    let counter = 1;
    let testSlug = finalSlug;
    while (this.state.events.some((e) => e.slug === testSlug)) {
      testSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newEvent: EventItem = {
      ...data,
      id: generateId('evt'),
      slug: testSlug,
      createdAt: now,
      updatedAt: now,
    };

    this.state.events = [newEvent, ...this.state.events];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'EVENT_CREATE',
      entity: 'EVENT',
      entityId: newEvent.id,
      details: `Menambahkan agenda: "${newEvent.title}"`,
    });

    this.saveState();
    return newEvent;
  }

  public updateEvent(id: string, data: Partial<EventItem>, user?: User | null): EventItem | null {
    const index = this.state.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const current = this.state.events[index];
    const now = new Date().toISOString();
    const updated: EventItem = {
      ...current,
      ...data,
      updatedAt: now,
    };

    this.state.events[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'EVENT_UPDATE',
      entity: 'EVENT',
      entityId: updated.id,
      details: `Memperbarui agenda: "${updated.title}"`,
    });

    this.saveState();
    return updated;
  }

  public deleteEvent(id: string, user?: User | null): boolean {
    const ev = this.state.events.find((e) => e.id === id);
    if (!ev) return false;

    this.state.events = this.state.events.filter((e) => e.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'EVENT_DELETE',
      entity: 'EVENT',
      entityId: id,
      details: `Menghapus agenda: "${ev.title}"`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // GALLERY (ALBUMS & PHOTOS)
  // ===========================================================================
  public getGalleryAlbums(): GalleryAlbum[] {
    return this.state.galleryAlbums.map((album) => {
      const photos = this.state.galleryPhotos.filter((p) => p.albumId === album.id);
      return {
        ...album,
        photosCount: photos.length,
        photos,
      };
    });
  }

  public getPublishedAlbums(): GalleryAlbum[] {
    return this.getGalleryAlbums().filter((a) => a.status === 'PUBLISHED');
  }

  public getAlbumBySlug(slug: string): GalleryAlbum | undefined {
    return this.getGalleryAlbums().find((a) => a.slug === slug);
  }

  public createAlbum(
    data: Omit<GalleryAlbum, 'id' | 'photosCount' | 'photos' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): GalleryAlbum {
    let finalSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
    let counter = 1;
    let testSlug = finalSlug;
    while (this.state.galleryAlbums.some((a) => a.slug === testSlug)) {
      testSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newAlbum: GalleryAlbum = {
      ...data,
      id: generateId('album'),
      slug: testSlug,
      photosCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.state.galleryAlbums = [newAlbum, ...this.state.galleryAlbums];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ALBUM_CREATE',
      entity: 'GALLERY',
      entityId: newAlbum.id,
      details: `Membuat album galeri: "${newAlbum.title}"`,
    });

    this.saveState();
    return newAlbum;
  }

  public updateAlbum(id: string, data: Partial<GalleryAlbum>, user?: User | null): GalleryAlbum | null {
    const index = this.state.galleryAlbums.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = this.state.galleryAlbums[index];
    const now = new Date().toISOString();
    const updated: GalleryAlbum = {
      ...current,
      ...data,
      updatedAt: now,
    };

    this.state.galleryAlbums[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ALBUM_UPDATE',
      entity: 'GALLERY',
      entityId: updated.id,
      details: `Memperbarui album galeri: "${updated.title}"`,
    });

    this.saveState();
    return updated;
  }

  public deleteAlbum(id: string, user?: User | null): boolean {
    const album = this.state.galleryAlbums.find((a) => a.id === id);
    if (!album) return false;

    // Hapus foto terkait
    this.state.galleryPhotos = this.state.galleryPhotos.filter((p) => p.albumId !== id);
    this.state.galleryAlbums = this.state.galleryAlbums.filter((a) => a.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ALBUM_DELETE',
      entity: 'GALLERY',
      entityId: id,
      details: `Menghapus album galeri beserta foto: "${album.title}"`,
    });

    this.saveState();
    return true;
  }

  public addPhotoToAlbum(
    photoData: { albumId: string; imageUrl: string; caption?: string },
    user?: User | null
  ): GalleryPhoto {
    const album = this.state.galleryAlbums.find((a) => a.id === photoData.albumId);
    const existingPhotos = this.state.galleryPhotos.filter((p) => p.albumId === photoData.albumId);

    const newPhoto: GalleryPhoto = {
      id: generateId('photo'),
      albumId: photoData.albumId,
      imageUrl: photoData.imageUrl,
      caption: photoData.caption,
      sortOrder: existingPhotos.length + 1,
      createdAt: new Date().toISOString(),
    };

    this.state.galleryPhotos = [...this.state.galleryPhotos, newPhoto];

    // Jika album belum punya cover image, pasang foto ini
    if (album && !album.coverImage) {
      album.coverImage = newPhoto.imageUrl;
    }

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PHOTO_ADD',
      entity: 'GALLERY',
      entityId: newPhoto.id,
      details: `Menambahkan foto ke album: "${album?.title || photoData.albumId}"`,
    });

    this.saveState();
    return newPhoto;
  }

  public deletePhoto(photoId: string, user?: User | null): boolean {
    const photo = this.state.galleryPhotos.find((p) => p.id === photoId);
    if (!photo) return false;

    this.state.galleryPhotos = this.state.galleryPhotos.filter((p) => p.id !== photoId);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PHOTO_DELETE',
      entity: 'GALLERY',
      entityId: photoId,
      details: `Menghapus foto dari album ${photo.albumId}`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // NAVIGATION MENUS (INTERACTIVE BUILDER)
  // ===========================================================================
  public getMenus(): NavigationMenu[] {
    return [...this.state.menus].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Menghasilkan struktur pohon menu bersarang untuk navbar
   */
  public getMenuTree(): NavigationMenu[] {
    const activeMenus = this.state.menus.filter((m) => m.isActive);
    const rootMenus = activeMenus.filter((m) => !m.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

    return rootMenus.map((root) => {
      const children = activeMenus
        .filter((m) => m.parentId === root.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return {
        ...root,
        children: children.length > 0 ? children : undefined,
      };
    });
  }

  public validateMenuNoCycle(menuId: string, candidateParentId: string | null): boolean {
    if (!candidateParentId) return true;
    if (menuId === candidateParentId) return false;

    let currentParentId: string | null | undefined = candidateParentId;
    const visited = new Set<string>([menuId]);

    while (currentParentId) {
      if (visited.has(currentParentId)) return false;
      visited.add(currentParentId);
      const parent = this.state.menus.find((m) => m.id === currentParentId);
      currentParentId = parent?.parentId;
    }

    return true;
  }

  public createMenu(
    data: Omit<NavigationMenu, 'id' | 'children' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): NavigationMenu {
    const now = new Date().toISOString();
    const newMenu: NavigationMenu = {
      ...data,
      id: generateId('menu'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.menus = [...this.state.menus, newMenu];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'MENU_CREATE',
      entity: 'MENU',
      entityId: newMenu.id,
      details: `Membuat tautan navigasi: "${newMenu.label}" (${newMenu.url})`,
    });

    this.saveState();
    return newMenu;
  }

  public updateMenu(
    id: string,
    data: Partial<NavigationMenu>,
    user?: User | null
  ): NavigationMenu | null {
    const index = this.state.menus.findIndex((m) => m.id === id);
    if (index === -1) return null;

    if (data.parentId !== undefined && data.parentId !== this.state.menus[index].parentId) {
      if (!this.validateMenuNoCycle(id, data.parentId || null)) {
        throw new Error('Tidak dapat memilih submenu sebagai induk navigasi (siklus terdeteksi).');
      }
    }

    const current = this.state.menus[index];
    const now = new Date().toISOString();
    const updated: NavigationMenu = {
      ...current,
      ...data,
      updatedAt: now,
    };

    this.state.menus[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'MENU_UPDATE',
      entity: 'MENU',
      entityId: updated.id,
      details: `Memperbarui menu navigasi: "${updated.label}"`,
    });

    this.saveState();
    return updated;
  }

  public deleteMenu(id: string, user?: User | null): boolean {
    const menu = this.state.menus.find((m) => m.id === id);
    if (!menu) return false;

    // Reparent anak-anak menu ini ke level atas
    this.state.menus = this.state.menus.map((m) => {
      if (m.parentId === id) {
        return { ...m, parentId: menu.parentId || null };
      }
      return m;
    });

    this.state.menus = this.state.menus.filter((m) => m.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'MENU_DELETE',
      entity: 'MENU',
      entityId: id,
      details: `Menghapus menu navigasi: "${menu.label}"`,
    });

    this.saveState();
    return true;
  }

  public reorderMenus(
    orderList: { id: string; sortOrder: number; parentId?: string | null }[],
    user?: User | null
  ) {
    this.state.menus = this.state.menus.map((m) => {
      const match = orderList.find((item) => item.id === m.id);
      if (match) {
        return {
          ...m,
          sortOrder: match.sortOrder,
          parentId: match.parentId !== undefined ? match.parentId : m.parentId,
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'MENU_REORDER',
      entity: 'MENU',
      details: 'Mengubah urutan susunan menu navigasi website',
    });

    this.saveState();
  }

  // ===========================================================================
  // COMMENTS & MODERATION
  // ===========================================================================
  public getComments(): Comment[] {
    return [...this.state.comments];
  }

  public getCommentsByContent(contentId: string, onlyApproved = true): Comment[] {
    return this.state.comments
      .filter((c) => c.contentId === contentId && (!onlyApproved || c.status === 'APPROVED'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createComment(
    data: {
      contentId: string;
      contentTitle?: string;
      contentType?: ContentType;
      authorName: string;
      authorEmail: string;
      content: string;
      honeypot?: string; // Anti-bot protection
    }
  ): Comment {
    // Basic anti-spam honeypot detection
    if (data.honeypot && data.honeypot.trim().length > 0) {
      throw new Error('Pesan ditolak oleh filter keamanan anti-bot.');
    }

    if (!data.authorName.trim() || !data.authorEmail.trim() || !data.content.trim()) {
      throw new Error('Seluruh bidang nama, email, dan komentar wajib diisi.');
    }

    // Heuristik sederhana penanda spam
    const isSuspicious = /slot|judi|casino|gacor|viagra|crypto-fast/i.test(data.content);

    const newComment: Comment = {
      id: generateId('comment'),
      contentId: data.contentId,
      contentTitle: data.contentTitle,
      contentType: data.contentType || 'ARTICLE',
      authorName: data.authorName.trim(),
      authorEmail: data.authorEmail.trim(),
      content: data.content.trim(),
      status: isSuspicious ? 'SPAM' : 'PENDING',
      ipAddress: '192.168.1.100',
      createdAt: new Date().toISOString(),
    };

    this.state.comments = [newComment, ...this.state.comments];
    this.saveState();
    return newComment;
  }

  public updateCommentStatus(id: string, status: CommentStatus, user?: User | null): boolean {
    const comment = this.state.comments.find((c) => c.id === id);
    if (!comment) return false;

    comment.status = status;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'COMMENT_MODERATE',
      entity: 'COMMENT',
      entityId: id,
      details: `Mengubah moderasi komentar dari ${comment.authorName} menjadi ${status}`,
    });

    this.saveState();
    return true;
  }

  public deleteComment(id: string, user?: User | null): boolean {
    const comment = this.state.comments.find((c) => c.id === id);
    if (!comment) return false;

    this.state.comments = this.state.comments.filter((c) => c.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'COMMENT_DELETE',
      entity: 'COMMENT',
      entityId: id,
      details: `Menghapus komentar dari ${comment.authorName}`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // PAGES (HALAMAN STATIS)
  // ===========================================================================
  public getPages(): Page[] {
    return [...this.state.pages];
  }

  public getPageBySlug(slug: string): Page | undefined {
    return this.state.pages.find((p) => p.slug === slug);
  }

  public getPageById(id: string): Page | undefined {
    return this.state.pages.find((p) => p.id === id);
  }

  public createPage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): Page {
    let finalSlug = pageData.slug?.trim() ? slugify(pageData.slug) : slugify(pageData.title);
    let counter = 1;
    let testSlug = finalSlug;
    while (this.state.pages.some((p) => p.slug === testSlug)) {
      testSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newPage: Page = {
      ...pageData,
      id: generateId('page'),
      slug: testSlug,
      createdAt: now,
      updatedAt: now,
    };

    this.state.pages = [newPage, ...this.state.pages];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PAGE_CREATE',
      entity: 'PAGE',
      entityId: newPage.id,
      details: `Membuat halaman baru: "${newPage.title}"`,
    });

    this.saveState();
    return newPage;
  }

  public updatePage(id: string, pageData: Partial<Page>, user?: User | null): Page | null {
    const index = this.state.pages.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.state.pages[index];
    const now = new Date().toISOString();
    const updated: Page = {
      ...current,
      ...pageData,
      updatedAt: now,
    };

    this.state.pages[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PAGE_UPDATE',
      entity: 'PAGE',
      entityId: updated.id,
      details: `Memperbarui halaman: "${updated.title}"`,
    });

    this.saveState();
    return updated;
  }

  public deletePage(id: string, user?: User | null): boolean {
    const page = this.state.pages.find((p) => p.id === id);
    if (!page) return false;

    this.state.pages = this.state.pages.filter((p) => p.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PAGE_DELETE',
      entity: 'PAGE',
      entityId: id,
      details: `Menghapus halaman: "${page.title}"`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // MEDIA
  // ===========================================================================
  public getMedia(filterType: MediaTypeFilter = 'ALL'): Media[] {
    if (filterType === 'ALL') return [...this.state.media];

    return this.state.media.filter((m) => {
      if (filterType === 'IMAGE') return m.mimeType.startsWith('image/');
      if (filterType === 'VIDEO') return m.mimeType.startsWith('video/');
      if (filterType === 'AUDIO') return m.mimeType.startsWith('audio/');
      if (filterType === 'PDF') return m.mimeType === 'application/pdf';
      if (filterType === 'DOC') {
        return (
          m.mimeType.includes('word') ||
          m.mimeType.includes('sheet') ||
          m.mimeType.includes('text') ||
          m.mimeType.includes('presentation')
        );
      }
      return true;
    });
  }

  public createMedia(
    mediaData: Omit<Media, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): Media {
    const now = new Date().toISOString();
    const newMedia: Media = {
      ...mediaData,
      id: generateId('med'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.media = [newMedia, ...this.state.media];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'MEDIA_UPLOAD',
      entity: 'MEDIA',
      entityId: newMedia.id,
      details: `Mengunggah berkas: ${newMedia.fileName} (${Math.round(newMedia.fileSize / 1024)} KB)`,
    });

    this.saveState();
    return newMedia;
  }

  public deleteMedia(id: string, user?: User | null): boolean {
    const item = this.state.media.find((m) => m.id === id);
    if (!item) return false;

    this.state.media = this.state.media.filter((m) => m.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'MEDIA_DELETE',
      entity: 'MEDIA',
      entityId: id,
      details: `Menghapus berkas media: ${item.fileName}`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // USERS & RBAC MANAGEMENT (PHASE 3)
  // ===========================================================================
  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public createUser(
    userData: {
      name: string;
      email: string;
      phone?: string;
      password?: string;
      passwordHash?: string;
      image?: string;
      role?: RoleName;
      roles?: RoleName[];
      status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_INVITE';
      isActive?: boolean;
    },
    user?: User | null
  ): User {
    const cleanEmail = userData.email.trim().toLowerCase();
    
    // Validasi Keunikan Email (Requirement C & Section U)
    if (this.state.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Alamat email "${userData.email}" telah terdaftar di sistem. Gunakan alamat email lain.`);
    }

    // Validasi Format Nomor Telepon jika diisi
    if (userData.phone && userData.phone.trim().length > 0) {
      const phoneClean = userData.phone.replace(/[\s\-\(\)]/g, '');
      if (!/^\+?[0-9]{8,15}$/.test(phoneClean)) {
        throw new Error('Format nomor telepon tidak valid. Gunakan 8-15 digit angka (cth: 08123456789 atau +628123456789).');
      }
    }

    const assignedRoles: RoleName[] = Array.isArray(userData.roles) && userData.roles.length > 0
      ? userData.roles
      : [userData.role || 'GURU'];

    const primaryRole = assignedRoles[0] || 'GURU';
    const now = new Date().toISOString();
    const finalStatus = userData.status || (userData.isActive === false ? 'INACTIVE' : 'ACTIVE');

    const newUser: User = {
      id: generateId('user'),
      name: userData.name.trim(),
      email: cleanEmail,
      phone: userData.phone?.trim() || undefined,
      passwordHash: userData.passwordHash || userData.password || 'Nusantara123!',
      image: userData.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
      role: primaryRole,
      roles: assignedRoles,
      status: finalStatus,
      isActive: finalStatus === 'ACTIVE',
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.state.users = [newUser, ...this.state.users];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'USER_CREATE',
      entity: 'USER',
      entityId: newUser.id,
      details: `Membuat akun pengguna: ${newUser.name} (${cleanEmail}) dengan role [${assignedRoles.join(', ')}]`,
    });

    this.saveState();
    return newUser;
  }

  public updateUser(
    id: string,
    userData: Partial<User> & { password?: string },
    user?: User | null
  ): User {
    const index = this.state.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    const current = this.state.users[index];

    // Jika mengubah email, pastikan unik di seluruh sistem
    if (userData.email && userData.email.trim().toLowerCase() !== current.email.toLowerCase()) {
      const cleanEmail = userData.email.trim().toLowerCase();
      if (this.state.users.some((u) => u.id !== id && u.email.toLowerCase() === cleanEmail)) {
        throw new Error(`Alamat email "${userData.email}" telah digunakan oleh pengguna lain.`);
      }
    }

    // Validasi format nomor telepon jika diperbarui
    if (userData.phone && userData.phone.trim().length > 0) {
      const phoneClean = userData.phone.replace(/[\s\-\(\)]/g, '');
      if (!/^\+?[0-9]{8,15}$/.test(phoneClean)) {
        throw new Error('Format nomor telepon tidak valid. Gunakan 8-15 digit angka.');
      }
    }

    const assignedRoles = userData.roles || current.roles || [current.role];
    const primaryRole = userData.role || assignedRoles[0] || current.role;
    const now = new Date().toISOString();

    const updatedStatus = userData.status !== undefined 
      ? userData.status 
      : (userData.isActive !== undefined ? (userData.isActive ? 'ACTIVE' : 'INACTIVE') : current.status);

    const updated: User = {
      ...current,
      ...userData,
      email: userData.email ? userData.email.trim().toLowerCase() : current.email,
      role: primaryRole,
      roles: assignedRoles,
      status: updatedStatus,
      isActive: updatedStatus === 'ACTIVE',
      passwordHash: userData.password ? userData.password : (userData.passwordHash || current.passwordHash),
      updatedAt: now,
    };

    this.state.users[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'USER_UPDATE',
      entity: 'USER',
      entityId: updated.id,
      details: `Memperbarui akun pengguna: ${updated.name} (${updated.email})`,
    });

    this.saveState();
    return updated;
  }

  public deleteUser(id: string, user?: User | null): boolean {
    const target = this.state.users.find((u) => u.id === id);
    if (!target) return false;

    // Safety rule D & U: SUPER_ADMIN tidak boleh dapat dihapus oleh siapapun
    const isSuperAdmin = target.role === 'SUPER_ADMIN' || (target.roles && target.roles.includes('SUPER_ADMIN'));
    if (isSuperAdmin) {
      throw new Error('Akun SUPER_ADMIN dilindungi oleh sistem keamanan inti dan tidak dapat dihapus.');
    }

    // Soft delete / Arsip status: Ubah status menjadi INACTIVE untuk menjaga integritas jejak audit dan riwayat akademik
    this.state.users = this.state.users.map((u) => 
      u.id === id ? { ...u, status: 'INACTIVE', isActive: false, updatedAt: new Date().toISOString() } : u
    );

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'USER_DELETE',
      entity: 'USER',
      entityId: id,
      details: `Menonaktifkan / mengarsipkan akun pengguna: ${target.name} (${target.email})`,
    });

    this.saveState();
    return true;
  }

  public blockUser(id: string, reason?: string, user?: User | null): User {
    const target = this.state.users.find((u) => u.id === id);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    if (target.role === 'SUPER_ADMIN') {
      throw new Error('Akun SUPER_ADMIN tidak dapat diblokir.');
    }

    const updated = this.updateUser(id, { status: 'BLOCKED', isActive: false }, user);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'USER_BLOCK',
      entity: 'USER',
      entityId: id,
      details: `Memblokir akses akun: ${target.name} (${target.email}). Alasan: ${reason || 'Pelanggaran keamanan / instruksi admin'}`,
    });

    return updated;
  }

  public unblockUser(id: string, user?: User | null): User {
    const updated = this.updateUser(id, {
      status: 'ACTIVE',
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: undefined,
    }, user);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'USER_UNBLOCK',
      entity: 'USER',
      entityId: id,
      details: `Membuka blokir akun: ${updated.name} (${updated.email})`,
    });

    return updated;
  }

  public resetUserPassword(id: string, newPassword: string, user?: User | null): boolean {
    const target = this.state.users.find((u) => u.id === id);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Kata sandi baru minimal harus 6 karakter.');
    }

    target.passwordHash = newPassword;
    target.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PASSWORD_RESET_ADMIN',
      entity: 'USER',
      entityId: id,
      details: `Mengatur ulang kata sandi untuk pengguna: ${target.name} (${target.email})`,
    });

    this.saveState();
    return true;
  }

  public assignRoleToUser(userId: string, roleName: RoleName, user?: User | null): User {
    const target = this.state.users.find((u) => u.id === userId);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    const currentRoles = Array.isArray(target.roles) ? target.roles : [target.role];
    if (!currentRoles.includes(roleName)) {
      const newRoles = [...currentRoles, roleName];
      return this.updateUser(userId, { roles: newRoles, role: newRoles[0] }, user);
    }
    return target;
  }

  public revokeRoleFromUser(userId: string, roleName: RoleName, user?: User | null): User {
    const target = this.state.users.find((u) => u.id === userId);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    const currentRoles = Array.isArray(target.roles) ? target.roles : [target.role];
    if (currentRoles.length <= 1) {
      throw new Error('Pengguna minimal harus memiliki satu peran aktif.');
    }

    const newRoles = currentRoles.filter((r) => r !== roleName);
    return this.updateUser(userId, { roles: newRoles, role: newRoles[0] }, user);
  }

  public recordLoginAttempt(
    email: string,
    status: 'SUCCESS' | 'FAILED' | 'BLOCKED',
    options?: { userId?: string; ipAddress?: string; userAgent?: string; reason?: string }
  ) {
    const newHistory: LoginHistory = {
      id: generateId('lh'),
      userId: options?.userId,
      email: email.trim().toLowerCase(),
      ipAddress: options?.ipAddress || '127.0.0.1',
      userAgent: options?.userAgent || 'Browser Client',
      status,
      reason: options?.reason,
      createdAt: new Date().toISOString(),
    };

    this.state.loginHistories = [newHistory, ...this.state.loginHistories].slice(0, 500);

    // Update user login timestamp if success
    if (status === 'SUCCESS' && options?.userId) {
      const u = this.state.users.find((usr) => usr.id === options.userId);
      if (u) {
        u.lastLoginAt = new Date().toISOString();
        u.failedLoginAttempts = 0;
      }
    }

    this.saveState();
  }

  public getLoginHistories(userId?: string): LoginHistory[] {
    if (userId) {
      return this.state.loginHistories.filter((h) => h.userId === userId);
    }
    return [...this.state.loginHistories];
  }

  // ===========================================================================
  // ROLES & PERMISSIONS
  // ===========================================================================
  public getRoles(): Role[] {
    return [...this.state.roles];
  }

  public getRoleById(id: string): Role | undefined {
    return this.state.roles.find((r) => r.id === id);
  }

  public getRoleByName(name: string): Role | undefined {
    return this.state.roles.find((r) => r.name === name || r.code === name);
  }

  public createRole(
    data: {
      name: string;
      code: string;
      description: string;
      permissions: PermissionCode[];
      status?: 'ACTIVE' | 'INACTIVE';
    },
    user?: User | null
  ): Role {
    const codeUpper = data.code.trim().toUpperCase().replace(/\s+/g, '_');

    if (this.state.roles.some((r) => r.code === codeUpper || r.name === data.name.trim())) {
      throw new Error(`Role dengan kode "${codeUpper}" atau nama "${data.name}" sudah ada.`);
    }

    const now = new Date().toISOString();
    const newRole: Role = {
      id: generateId('role'),
      name: data.name.trim(),
      code: codeUpper,
      description: data.description.trim(),
      status: data.status || 'ACTIVE',
      isSystem: false,
      permissions: data.permissions || [],
      createdAt: now,
      updatedAt: now,
    };

    this.state.roles = [...this.state.roles, newRole];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ROLE_CREATE',
      entity: 'ROLE',
      entityId: newRole.id,
      details: `Mendefinisikan role kustom baru: ${newRole.name} [${newRole.code}]`,
    });

    this.saveState();
    return newRole;
  }

  public updateRole(
    id: string,
    data: Partial<Role>,
    user?: User | null
  ): Role {
    const index = this.state.roles.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Role tidak ditemukan.');

    const current = this.state.roles[index];

    // Cegah penggantian kode role sistem bawaan
    if (current.isSystem && data.code && data.code !== current.code) {
      throw new Error('Kode untuk role sistem inti tidak dapat diubah.');
    }

    const updated: Role = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.state.roles[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ROLE_UPDATE',
      entity: 'ROLE',
      entityId: id,
      details: `Memperbarui role: ${updated.name}`,
    });

    this.saveState();
    return updated;
  }

  public deleteRole(id: string, user?: User | null): boolean {
    const target = this.state.roles.find((r) => r.id === id);
    if (!target) return false;

    // Cegah penghapusan role sistem (SUPER_ADMIN, GURU, SISWA, dll.)
    if (target.isSystem || target.code === 'SUPER_ADMIN' || target.name === 'SUPER_ADMIN') {
      throw new Error(`Role "${target.name}" adalah role sistem bawaan dan tidak dapat dihapus.`);
    }

    // Cegah penghapusan role yang masih digunakan oleh pengguna (Requirement D & U)
    const usersWithRole = this.state.users.filter(
      (u) => u.role === target.code || (Array.isArray(u.roles) && u.roles.includes(target.code))
    );
    if (usersWithRole.length > 0) {
      throw new Error(
        `Role "${target.name}" sedang digunakan oleh ${usersWithRole.length} pengguna aktif. Harap alihkan role pengguna tersebut sebelum menghapus role ini.`
      );
    }

    this.state.roles = this.state.roles.filter((r) => r.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ROLE_DELETE',
      entity: 'ROLE',
      entityId: id,
      details: `Menghapus role kustom: ${target.name}`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // TEACHER PROFILES (PHASE 3)
  // ===========================================================================
  public getTeacherProfiles(): TeacherProfile[] {
    return [...this.state.teacherProfiles];
  }

  public getTeacherProfileById(id: string): TeacherProfile | undefined {
    return this.state.teacherProfiles.find((t) => t.id === id);
  }

  public getTeacherProfileByUserId(userId: string): TeacherProfile | undefined {
    return this.state.teacherProfiles.find((t) => t.userId === userId);
  }

  public createTeacherProfile(
    data: Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): TeacherProfile {
    // Validasi keunikan NIP jika ada
    if (data.nip && data.nip.trim().length > 0) {
      const cleanNip = data.nip.trim();
      if (this.state.teacherProfiles.some((t) => t.nip === cleanNip)) {
        throw new Error(`NIP "${data.nip}" sudah digunakan oleh guru lain.`);
      }
    }

    const now = new Date().toISOString();
    const newProfile: TeacherProfile = {
      ...data,
      id: generateId('tp'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.teacherProfiles = [newProfile, ...this.state.teacherProfiles];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TEACHER_PROFILE_CREATE',
      entity: 'TEACHER',
      entityId: newProfile.id,
      details: `Membuat profil pendidik: ${newProfile.fullName} (${newProfile.major})`,
    });

    this.saveState();
    return newProfile;
  }

  public updateTeacherProfile(
    id: string,
    data: Partial<TeacherProfile>,
    user?: User | null
  ): TeacherProfile {
    const index = this.state.teacherProfiles.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Profil guru tidak ditemukan.');

    const current = this.state.teacherProfiles[index];

    // Cek keunikan NIP jika diperbarui
    if (data.nip && data.nip.trim() !== current.nip) {
      const cleanNip = data.nip.trim();
      if (this.state.teacherProfiles.some((t) => t.id !== id && t.nip === cleanNip)) {
        throw new Error(`NIP "${data.nip}" sudah digunakan oleh guru lain.`);
      }
    }

    const updated: TeacherProfile = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.state.teacherProfiles[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TEACHER_PROFILE_UPDATE',
      entity: 'TEACHER',
      entityId: id,
      details: `Memperbarui profil guru: ${updated.fullName}`,
    });

    this.saveState();
    return updated;
  }

  public deleteTeacherProfile(id: string, user?: User | null): boolean {
    const target = this.state.teacherProfiles.find((t) => t.id === id);
    if (!target) return false;

    // Hapus atau nonaktifkan
    this.state.teacherProfiles = this.state.teacherProfiles.filter((t) => t.id !== id);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TEACHER_PROFILE_DELETE',
      entity: 'TEACHER',
      entityId: id,
      details: `Menghapus profil guru: ${target.fullName}`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // STUDENT PROFILES (PHASE 3)
  // ===========================================================================
  public getStudentProfiles(): StudentProfile[] {
    return [...this.state.studentProfiles];
  }

  public getStudentProfileById(id: string): StudentProfile | undefined {
    return this.state.studentProfiles.find((s) => s.id === id);
  }

  public getStudentProfileByUserId(userId: string): StudentProfile | undefined {
    return this.state.studentProfiles.find((s) => s.userId === userId);
  }

  public createStudentProfile(
    data: Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): StudentProfile {
    // Validasi NIS wajib unik per sekolah
    const cleanNis = data.nis.trim();
    if (this.state.studentProfiles.some((s) => s.nis.trim() === cleanNis)) {
      throw new Error(`Nomor Induk Siswa (NIS) "${data.nis}" sudah terdaftar.`);
    }

    // Validasi NISN jika ada
    if (data.nisn && data.nisn.trim().length > 0) {
      const cleanNisn = data.nisn.trim();
      if (this.state.studentProfiles.some((s) => s.nisn?.trim() === cleanNisn)) {
        throw new Error(`NISN "${data.nisn}" sudah terdaftar.`);
      }
    }

    const now = new Date().toISOString();
    const newProfile: StudentProfile = {
      ...data,
      status: data.status || 'AKTIF',
      id: generateId('sp'),
      nis: cleanNis,
      nisn: data.nisn?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.state.studentProfiles = [newProfile, ...this.state.studentProfiles];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'STUDENT_PROFILE_CREATE',
      entity: 'STUDENT',
      entityId: newProfile.id,
      details: `Mendaftarkan siswa: ${newProfile.fullName} (NIS: ${newProfile.nis}, Kelas: ${newProfile.className || '-'})`,
    });

    this.saveState();
    return newProfile;
  }

  public updateStudentProfile(
    id: string,
    data: Partial<StudentProfile>,
    user?: User | null
  ): StudentProfile {
    const index = this.state.studentProfiles.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Profil siswa tidak ditemukan.');

    const current = this.state.studentProfiles[index];

    if (data.nis && data.nis.trim() !== current.nis) {
      const cleanNis = data.nis.trim();
      if (this.state.studentProfiles.some((s) => s.id !== id && s.nis.trim() === cleanNis)) {
        throw new Error(`Nomor Induk Siswa (NIS) "${data.nis}" sudah terdaftar.`);
      }
    }

    const updated: StudentProfile = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.state.studentProfiles[index] = updated;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'STUDENT_PROFILE_UPDATE',
      entity: 'STUDENT',
      entityId: id,
      details: `Memperbarui profil siswa: ${updated.fullName}`,
    });

    this.saveState();
    return updated;
  }

  public deleteStudentProfile(id: string, user?: User | null): boolean {
    const target = this.state.studentProfiles.find((s) => s.id === id);
    if (!target) return false;

    // Requirement R: Hindari penghapusan fisik yang menghilangkan riwayat akademik! Gunakan status NONAKTIF
    target.status = 'NONAKTIF';
    target.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'STUDENT_ARCHIVE',
      entity: 'STUDENT',
      entityId: id,
      details: `Mengarsipkan data siswa (status nonaktif): ${target.fullName} (${target.nis})`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // PARENT PROFILES & RELATIONS (PHASE 3)
  // ===========================================================================
  public getParentProfiles(): ParentProfile[] {
    return [...this.state.parentProfiles];
  }

  public getParentProfileById(id: string): ParentProfile | undefined {
    return this.state.parentProfiles.find((p) => p.id === id);
  }

  public getParentProfileByUserId(userId: string): ParentProfile | undefined {
    return this.state.parentProfiles.find((p) => p.userId === userId);
  }

  public createParentProfile(
    data: Omit<ParentProfile, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): ParentProfile {
    const now = new Date().toISOString();
    const newProfile: ParentProfile = {
      ...data,
      id: generateId('pp'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.parentProfiles = [newProfile, ...this.state.parentProfiles];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PARENT_PROFILE_CREATE',
      entity: 'PARENT',
      entityId: newProfile.id,
      details: `Mendaftarkan profil orang tua/wali: ${newProfile.fullName}`,
    });

    this.saveState();
    return newProfile;
  }

  public updateParentProfile(
    id: string,
    data: Partial<ParentProfile>,
    user?: User | null
  ): ParentProfile {
    const index = this.state.parentProfiles.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Profil orang tua tidak ditemukan.');

    const current = this.state.parentProfiles[index];
    const updated: ParentProfile = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.state.parentProfiles[index] = updated;
    this.saveState();
    return updated;
  }

  public getStudentParents(): StudentParent[] {
    return [...this.state.studentParents];
  }

  public getParentsByStudentId(studentId: string): (StudentParent & { parent: ParentProfile })[] {
    const relations = this.state.studentParents.filter((r) => r.studentId === studentId);
    return relations
      .map((r) => {
        const parent = this.state.parentProfiles.find((p) => p.id === r.parentId);
        return parent ? { ...r, parent } : null;
      })
      .filter((item): item is StudentParent & { parent: ParentProfile } => item !== null);
  }

  public getStudentsByParentId(parentId: string): (StudentParent & { student: StudentProfile })[] {
    const relations = this.state.studentParents.filter((r) => r.parentId === parentId);
    return relations
      .map((r) => {
        const student = this.state.studentProfiles.find((s) => s.id === r.studentId);
        return student ? { ...r, student } : null;
      })
      .filter((item): item is StudentParent & { student: StudentProfile } => item !== null);
  }

  public linkStudentParent(
    studentId: string,
    parentId: string,
    relationship: 'AYAH' | 'IBU' | 'WALI',
    isPrimaryContact = false,
    canViewAcademicData = true,
    user?: User | null
  ): StudentParent {
    // Hindari duplikasi relasi identik
    const existing = this.state.studentParents.find(
      (r) => r.studentId === studentId && r.parentId === parentId
    );
    if (existing) {
      existing.relationship = relationship;
      existing.isPrimaryContact = isPrimaryContact;
      existing.canViewAcademicData = canViewAcademicData;
      this.saveState();
      return existing;
    }

    const newRel: StudentParent = {
      id: generateId('sp-rel'),
      studentId,
      parentId,
      relationship,
      isPrimaryContact,
      canViewAcademicData,
      createdAt: new Date().toISOString(),
    };

    this.state.studentParents = [...this.state.studentParents, newRel];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'STUDENT_PARENT_LINK',
      entity: 'PARENT_RELATION',
      entityId: newRel.id,
      details: `Menghubungkan orang tua (${parentId}) dengan siswa (${studentId}) sebagai ${relationship}`,
    });

    this.saveState();
    return newRel;
  }

  public unlinkStudentParent(id: string, user?: User | null): boolean {
    this.state.studentParents = this.state.studentParents.filter((r) => r.id !== id);
    this.saveState();
    return true;
  }

  // ===========================================================================
  // STAFF PROFILES (TENAGA KEPENDIDIKAN)
  // ===========================================================================
  public getStaffProfiles(): StaffProfile[] {
    return [...this.state.staffProfiles];
  }

  public getStaffProfileById(id: string): StaffProfile | undefined {
    return this.state.staffProfiles.find((s) => s.id === id);
  }

  public getStaffProfileByUserId(userId: string): StaffProfile | undefined {
    return this.state.staffProfiles.find((s) => s.userId === userId);
  }

  public createStaffProfile(
    data: Omit<StaffProfile, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): StaffProfile {
    const cleanNum = data.employeeNumber.trim();
    if (this.state.staffProfiles.some((s) => s.employeeNumber.trim() === cleanNum)) {
      throw new Error(`Nomor Pegawai "${data.employeeNumber}" sudah digunakan.`);
    }

    const now = new Date().toISOString();
    const newProfile: StaffProfile = {
      ...data,
      id: generateId('staff'),
      employeeNumber: cleanNum,
      createdAt: now,
      updatedAt: now,
    };

    this.state.staffProfiles = [newProfile, ...this.state.staffProfiles];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'STAFF_PROFILE_CREATE',
      entity: 'STAFF',
      entityId: newProfile.id,
      details: `Mendaftarkan tenaga kependidikan: ${newProfile.position} (${newProfile.department})`,
    });

    this.saveState();
    return newProfile;
  }

  public updateStaffProfile(
    id: string,
    data: Partial<StaffProfile>,
    user?: User | null
  ): StaffProfile {
    const index = this.state.staffProfiles.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Data staf kependidikan tidak ditemukan.');

    const current = this.state.staffProfiles[index];
    const updated: StaffProfile = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.state.staffProfiles[index] = updated;
    this.saveState();
    return updated;
  }

  // ===========================================================================
  // HOMEROOM ASSIGNMENTS (WALI KELAS)
  // ===========================================================================
  public getHomeroomAssignments(): HomeroomAssignment[] {
    return [...this.state.homeroomAssignments];
  }

  public createHomeroomAssignment(
    data: Omit<HomeroomAssignment, 'id' | 'createdAt'>,
    user?: User | null
  ): HomeroomAssignment {
    const isNowActive = data.isActive !== undefined ? data.isActive : true;

    // Requirement I & Section U:
    // "Batasan agar satu kelas hanya memiliki satu wali kelas aktif dalam satu periode tahun ajaran"
    if (isNowActive) {
      const activeDuplicate = this.state.homeroomAssignments.find(
        (hr) => hr.classId === data.classId && hr.academicYearId === data.academicYearId && hr.isActive
      );
      if (activeDuplicate) {
        throw new Error(
          `Kelas "${data.className}" sudah memiliki wali kelas aktif (${activeDuplicate.teacherName || 'Guru lain'}) pada tahun ajaran ${data.academicYearName}. Nonaktifkan penugasan sebelumnya terlebih dahulu.`
        );
      }
    }

    const newAssignment: HomeroomAssignment = {
      ...data,
      isActive: isNowActive,
      id: generateId('hr'),
      createdAt: new Date().toISOString(),
    };

    this.state.homeroomAssignments = [newAssignment, ...this.state.homeroomAssignments];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'HOMEROOM_ASSIGN',
      entity: 'HOMEROOM',
      entityId: newAssignment.id,
      details: `Menetapkan wali kelas: ${newAssignment.teacherName} untuk ${newAssignment.className} (${newAssignment.academicYearName})`,
    });

    this.saveState();
    return newAssignment;
  }

  public deactivateHomeroomAssignment(id: string, user?: User | null): boolean {
    const item = this.state.homeroomAssignments.find((hr) => hr.id === id);
    if (!item) return false;

    item.isActive = false;
    item.endDate = new Date().toISOString().split('T')[0];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'HOMEROOM_DEACTIVATE',
      entity: 'HOMEROOM',
      entityId: id,
      details: `Menonaktifkan penugasan wali kelas: ${item.teacherName} (${item.className})`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // INVITATIONS & PASSWORD RESET TOKENS (PHASE 3)
  // ===========================================================================
  public getInvitations(): UserInvitation[] {
    return [...this.state.invitations];
  }

  public createInvitation(
    emailOrData: string | { email: string; roles?: RoleName[]; invitedBy?: string; name?: string },
    rolesParam?: RoleName[],
    invitedByParam?: string,
    nameParam?: string,
    user?: User | null
  ): UserInvitation {
    let email = '';
    let roles: RoleName[] = ['GURU'];
    let invitedBy = 'Administrator';
    let name: string | undefined = undefined;

    if (typeof emailOrData === 'object' && emailOrData !== null) {
      email = emailOrData.email || '';
      roles = emailOrData.roles && emailOrData.roles.length > 0 ? emailOrData.roles : ['GURU'];
      invitedBy = emailOrData.invitedBy || 'Administrator';
      name = emailOrData.name;
    } else {
      email = String(emailOrData || '');
      roles = rolesParam && rolesParam.length > 0 ? rolesParam : ['GURU'];
      invitedBy = invitedByParam || 'Administrator';
      name = nameParam;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Pastikan user belum terdaftar
    if (this.state.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Pengguna dengan email "${cleanEmail}" sudah terdaftar.`);
    }

    // Token acak berkekuatan tinggi
    const token = `inv_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 hari

    const inv: UserInvitation = {
      id: generateId('inv'),
      email: cleanEmail,
      name: name?.trim(),
      roles: roles.length > 0 ? roles : ['GURU'],
      token,
      expiresAt,
      status: 'PENDING',
      invitedBy,
      inviterName: user?.name || 'Administrator',
      createdAt: new Date().toISOString(),
    };

    this.state.invitations = [inv, ...this.state.invitations];

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'INVITATION_CREATE',
      entity: 'INVITATION',
      entityId: inv.id,
      details: `Menerbitkan undangan registrasi untuk email: ${cleanEmail} dengan role [${roles.join(', ')}]`,
    });

    this.saveState();
    return inv;
  }

  public acceptInvitation(
    token: string,
    arg1: string,
    arg2?: string
  ): User & { user: User; invitation: UserInvitation } {
    const inv = this.state.invitations.find((i) => i.token === token && i.status === 'PENDING');
    if (!inv) {
      throw new Error('Token undangan tidak valid atau sudah kedaluwarsa.');
    }

    if (new Date(inv.expiresAt) < new Date()) {
      inv.status = 'EXPIRED';
      this.saveState();
      throw new Error('Masa berlaku tiket undangan telah kedaluwarsa. Silakan minta undangan baru kepada administrator.');
    }

    // arg1 & arg2 can be (password, name) or (name, password)
    let password = arg1;
    let name = arg2;
    if (arg2 && arg2.length >= 6 && (!arg1 || arg1.length < 6 || arg1.includes(' '))) {
      name = arg1;
      password = arg2;
    }

    // Buat akun pengguna
    const newUser = this.createUser({
      name: name?.trim() || inv.name || inv.email.split('@')[0],
      email: inv.email,
      password: password,
      roles: inv.roles,
      role: inv.roles[0] || 'GURU',
      status: 'ACTIVE',
      isActive: true,
    });

    inv.status = 'ACCEPTED';
    inv.acceptedAt = new Date().toISOString();

    this.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'INVITATION_ACCEPTED',
      entity: 'INVITATION',
      entityId: inv.id,
      details: `Pengguna berhasil menyelesaikan aktivasi akun via undangan: ${inv.email}`,
    });

    this.saveState();
    const result = {
      ...newUser,
      user: newUser,
      invitation: inv,
    };
    return result as any;
  }

  public revokeInvitation(id: string, user?: User | null): boolean {
    const inv = this.state.invitations.find((i) => i.id === id);
    if (!inv) return false;

    inv.status = 'REVOKED';

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'INVITATION_REVOKE',
      entity: 'INVITATION',
      entityId: id,
      details: `Membatalkan tiket undangan: ${inv.email}`,
    });

    this.saveState();
    return true;
  }

  public createPasswordResetToken(email: string): PasswordResetToken {
    return this.requestPasswordReset(email);
  }

  public requestPasswordReset(email: string): PasswordResetToken {
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = this.state.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      throw new Error('Alamat email tidak ditemukan dalam basis data institusi.');
    }

    // Buat token sekali-pakai dengan masa berlaku 1 jam (Requirement L & Section U)
    const token = `rst_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const resetToken: PasswordResetToken = {
      id: generateId('rst'),
      userId: matchedUser.id,
      email: cleanEmail,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    };

    this.state.passwordResetTokens = [resetToken, ...this.state.passwordResetTokens];

    this.addAuditLog({
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      action: 'PASSWORD_RESET_REQUEST',
      entity: 'AUTH',
      entityId: resetToken.id,
      details: `Permintaan reset kata sandi diajukan untuk email: ${cleanEmail}`,
    });

    this.saveState();
    return resetToken;
  }

  public resetPasswordWithToken(token: string, newPassword: string): boolean {
    const rst = this.state.passwordResetTokens.find((r) => r.token === token && !r.used);
    if (!rst) {
      throw new Error('Token reset kata sandi tidak valid atau telah digunakan sebelumnya.');
    }

    if (new Date(rst.expiresAt) < new Date()) {
      throw new Error('Token reset kata sandi telah kedaluwarsa. Silakan ajukan permohonan baru.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Kata sandi baru minimal harus 6 karakter.');
    }

    const targetUser = this.state.users.find((u) => u.id === rst.userId);
    if (!targetUser) throw new Error('Pengguna tidak ditemukan.');

    targetUser.passwordHash = newPassword;
    targetUser.updatedAt = new Date().toISOString();
    targetUser.failedLoginAttempts = 0;
    targetUser.lockedUntil = undefined;
    targetUser.status = 'ACTIVE';
    targetUser.isActive = true;

    // Tandai token sebagai sudah dipakai (single-use)
    rst.used = true;

    this.addAuditLog({
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      action: 'PASSWORD_RESET_SUCCESS',
      entity: 'AUTH',
      entityId: rst.id,
      details: `Pengguna berhasil mereset kata sandi menggunakan token sekali pakai: ${rst.email}`,
    });

    this.saveState();
    return true;
  }

  // ===========================================================================
  // BATCH CSV IMPORT & EXPORT ENGINE (SECTION N)
  // ===========================================================================
  public importUsersCsv(
    type: 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF',
    rows: Record<string, string>[],
    user?: User | null
  ): {
    successCount: number;
    failedCount: number;
    errors: { row: number; identifier: string; error: string }[];
  } {
    const errors: { row: number; identifier: string; error: string }[] = [];
    let successCount = 0;

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // Baris CSV (baris 1 header)
      const name = (row.name || row.Nama || row['Nama Lengkap'] || '').trim();
      const email = (row.email || row.Email || '').trim().toLowerCase();
      const phone = (row.phone || row.telepon || row['Nomor HP'] || '').trim();

      if (!name) {
        errors.push({ row: rowNum, identifier: email || 'Baris kosong', error: 'Kolom Nama wajib diisi.' });
        return;
      }

      if (!email || !email.includes('@')) {
        errors.push({ row: rowNum, identifier: name, error: 'Alamat email tidak valid atau kosong.' });
        return;
      }

      // Deteksi Duplikasi Email
      if (this.state.users.some((u) => u.email.toLowerCase() === email)) {
        errors.push({ row: rowNum, identifier: email, error: `Email "${email}" sudah digunakan di sistem.` });
        return;
      }

      try {
        if (type === 'TEACHER') {
          const nip = (row.nip || row.NIP || '').trim();
          const major = (row.major || row['Bidang Studi'] || row.Mapel || 'Mata Pelajaran Umum').trim();
          const status = (row.status || row['Status Kepegawaian'] || 'HONORER').trim().toUpperCase();

          const newUser = this.createUser(
            { name, email, phone, role: 'GURU', roles: ['GURU'], status: 'ACTIVE' },
            user
          );

          this.createTeacherProfile(
            {
              userId: newUser.id,
              fullName: name,
              email,
              phone: phone || '-',
              nip: nip || undefined,
              nuptk: undefined,
              birthPlace: 'Indonesia',
              birthDate: '1985-01-01',
              gender: 'L',
              address: 'Alamat Sekolah',
              education: 'S1',
              major,
              employmentStatus: (['PNS', 'PPPK', 'HONORER', 'TETAP_YAYASAN', 'TIDAK_TETAP'].includes(status)
                ? status
                : 'HONORER') as any,
              startDate: new Date().toISOString().split('T')[0],
              isActive: true,
            },
            user
          );
          successCount++;
        } else if (type === 'STUDENT') {
          const nis = (row.nis || row.NIS || '').trim();
          const nisn = (row.nisn || row.NISN || '').trim();
          const className = (row.class || row.kelas || row.Kelas || 'X-A').trim();

          if (!nis) {
            errors.push({ row: rowNum, identifier: name, error: 'Kolom NIS wajib diisi untuk profil siswa.' });
            return;
          }

          if (this.state.studentProfiles.some((s) => s.nis === nis)) {
            errors.push({ row: rowNum, identifier: nis, error: `NIS "${nis}" sudah digunakan siswa lain.` });
            return;
          }

          const newUser = this.createUser(
            { name, email, phone, role: 'SISWA', roles: ['SISWA'], status: 'ACTIVE' },
            user
          );

          this.createStudentProfile(
            {
              userId: newUser.id,
              nis,
              nisn: nisn || undefined,
              fullName: name,
              email,
              phone,
              birthPlace: 'Indonesia',
              birthDate: '2009-01-01',
              gender: 'L',
              religion: 'Islam',
              address: 'Alamat Siswa',
              entryDate: new Date().toISOString().split('T')[0],
              status: 'AKTIF',
              className,
            },
            user
          );
          successCount++;
        } else if (type === 'PARENT') {
          const occupation = (row.occupation || row.pekerjaan || row.Pekerjaan || 'Wiraswasta').trim();
          const address = (row.address || row.alamat || row.Alamat || 'Kota').trim();

          const newUser = this.createUser(
            { name, email, phone, role: 'ORANG_TUA', roles: ['ORANG_TUA'], status: 'ACTIVE' },
            user
          );

          this.createParentProfile(
            {
              userId: newUser.id,
              fullName: name,
              email,
              phone: phone || '-',
              address,
              occupation,
              isActive: true,
            },
            user
          );
          successCount++;
        } else if (type === 'STAFF') {
          const position = (row.position || row.jabatan || row.Jabatan || 'Tata Usaha').trim();
          const department = (row.department || row.bagian || row.Unit || 'Tata Usaha').trim();
          const employeeNumber = (row.employeeNumber || row.nip || row.NIK || `PEG-${Date.now()}-${idx}`).trim();

          const newUser = this.createUser(
            { name, email, phone, role: 'TENAGA_ADMINISTRASI', roles: ['TENAGA_ADMINISTRASI'], status: 'ACTIVE' },
            user
          );

          this.createStaffProfile(
            {
              userId: newUser.id,
              employeeNumber,
              department,
              position,
              employmentStatus: 'TETAP_YAYASAN',
              startDate: new Date().toISOString().split('T')[0],
              phone: phone || '-',
              address: 'Alamat Sekolah',
              isActive: true,
            },
            user
          );
          successCount++;
        }
      } catch (err: any) {
        errors.push({ row: rowNum, identifier: name || email, error: err.message || 'Gagal menyimpan baris data.' });
      }
    });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'USER_IMPORT_CSV',
      entity: 'USER',
      details: `Import batch CSV [${type}]: Berhasil ${successCount}, Gagal ${errors.length}`,
    });

    return {
      successCount,
      failedCount: errors.length,
      errors,
    };
  }

  public exportUsersCsv(roleFilter?: string): string {
    const usersToExport = roleFilter && roleFilter !== 'ALL'
      ? this.state.users.filter((u) => u.role === roleFilter || (Array.isArray(u.roles) && u.roles.includes(roleFilter)))
      : this.state.users;

    // Header CSV aman: Tanpa password hash, token, atau informasi credential! (Requirement N & P)
    const headers = ['ID', 'Nama Lengkap', 'Alamat Email', 'Nomor Telepon', 'Role Utama', 'Seluruh Role', 'Status', 'Tanggal Dibuat', 'Terakhir Login'];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = usersToExport.map((u) => [
      escapeCsv(u.id),
      escapeCsv(u.name),
      escapeCsv(u.email),
      escapeCsv(u.phone || '-'),
      escapeCsv(u.role),
      escapeCsv(Array.isArray(u.roles) ? u.roles.join(';') : u.role),
      escapeCsv(u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE')),
      escapeCsv(u.createdAt ? u.createdAt.split('T')[0] : '-'),
      escapeCsv(u.lastLoginAt ? u.lastLoginAt.split('T')[0] : 'Belum pernah'),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportToCsv(type: 'USERS' = 'USERS', roleFilter?: string): string {
    return this.exportUsersCsv(roleFilter);
  }

  public batchImportFromCsv(
    type: 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF',
    csvText: string,
    user?: User | null
  ): {
    successCount: number;
    failedCount: number;
    errors: { row: number; identifier: string; error: string }[];
  } {
    const lines = csvText.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return { successCount: 0, failedCount: 0, errors: [] };
    }
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });

    return this.importUsersCsv(type, rows, user);
  }

  // ===========================================================================
  // REAL USER STATISTICS (SECTION O)
  // Mengambil data murni dari database tanpa angka dummy fiktif
  // ===========================================================================
  public getUserStats() {
    const totalUsers = this.state.users.length;
    const activeUsers = this.state.users.filter((u) => u.isActive && u.status !== 'BLOCKED').length;
    const inactiveUsers = this.state.users.filter((u) => u.status === 'INACTIVE' || !u.isActive).length;
    const blockedUsers = this.state.users.filter((u) => u.status === 'BLOCKED').length;

    const adminCount = this.state.users.filter(
      (u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN_SEKOLAH' || u.role === 'ADMIN'
    ).length;

    const kepsekCount = this.state.users.filter(
      (u) => u.role === 'KEPALA_SEKOLAH' || u.role === 'WAKIL_KEPALA_SEKOLAH'
    ).length;

    const teacherCount = this.state.users.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles : [u.role];
      return roles.includes('GURU') || roles.includes('WALI_KELAS');
    }).length;

    const studentCount = this.state.users.filter((u) => u.role === 'SISWA').length;
    const parentCount = this.state.users.filter((u) => u.role === 'ORANG_TUA').length;

    const staffCount = this.state.users.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles : [u.role];
      return roles.some((r) => ['TENAGA_ADMINISTRASI', 'BENDAHARA', 'PUSTAKAWAN', 'PETUGAS_SARPRAS'].includes(r));
    }).length;

    // Distribusi Role
    const roleCounts: Record<string, number> = {};
    this.state.users.forEach((u) => {
      const r = u.role || 'GURU';
      roleCounts[r] = (roleCounts[r] || 0) + 1;
    });

    const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
    }));

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      adminCount,
      kepsekCount,
      teacherCount,
      totalTeachers: this.state.teacherProfiles.length,
      studentCount,
      totalStudents: this.state.studentProfiles.length,
      parentCount,
      totalParents: this.state.parentProfiles.length,
      staffCount,
      totalStaff: this.state.staffProfiles.length,
      roleDistribution,
    };
  }

  // ===========================================================================
  // GLOBAL SEARCH (ACROSS ALL CONTENT & USERS)
  // ===========================================================================
  public globalSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        articles: [],
        news: [],
        pages: [],
        announcements: [],
        events: [],
        gallery: [],
        total: 0,
      };
    }

    const publicPosts = this.getPublicPosts();
    const articles = publicPosts.filter(
      (p) =>
        p.type === 'ARTICLE' &&
        (p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)))
    );

    const news = publicPosts.filter(
      (p) =>
        p.type === 'NEWS' &&
        (p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)))
    );

    const pages = this.state.pages.filter(
      (p) =>
        p.status === 'PUBLISHED' &&
        (p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q))
    );

    const announcements = this.state.announcements.filter(
      (a) =>
        a.status === 'PUBLISHED' &&
        (a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q))
    );

    const events = this.state.events.filter(
      (e) =>
        e.status === 'PUBLISHED' &&
        (e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q))
    );

    const gallery = this.getPublishedAlbums().filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
    );

    const total =
      articles.length + news.length + pages.length + announcements.length + events.length + gallery.length;

    return {
      articles,
      news,
      pages,
      announcements,
      events,
      gallery,
      total,
    };
  }

  // Backward compatibility alias methods
  public addMedia(data: Omit<Media, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): Media {
    return this.createMedia(data, user);
  }

  public deletePost(id: string, user?: User | null): boolean {
    return this.trashPost(id, user);
  }

  public updateRolePermissions(
    roleName: RoleName,
    permissions: PermissionCode[],
    user?: User | null
  ): Role | null {
    const roleIndex = this.state.roles.findIndex((r) => r.name === roleName || r.code === roleName);
    if (roleIndex === -1) return null;

    this.state.roles[roleIndex] = {
      ...this.state.roles[roleIndex],
      permissions,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ROLE_PERMISSIONS_UPDATE',
      entity: 'ROLE',
      entityId: this.state.roles[roleIndex].id,
      details: `Memperbarui izin matriks role ${roleName} (${permissions.length} izin)`,
    });

    this.saveState();
    return this.state.roles[roleIndex];
  }

  // ===========================================================================
  // PHASE 4: MULTI-TENANT SAAS ARCHITECTURE METHODS
  // ===========================================================================

  public getActiveTenantId(): string {
    return this.state.activeTenantId || 'tenant-sman-nusantara';
  }

  public setActiveTenant(tenantId: string) {
    const tenant = this.state.tenants.find((t) => t.id === tenantId);
    if (tenant) {
      this.state.activeTenantId = tenantId;
      this.saveState();
    }
  }

  public getActiveTenant(): Tenant | null {
    const id = this.getActiveTenantId();
    return this.state.tenants.find((t) => t.id === id) || this.state.tenants[0] || null;
  }

  public getTenants(): Tenant[] {
    return [...this.state.tenants];
  }

  public getTenantById(id: string): Tenant | null {
    return this.state.tenants.find((t) => t.id === id) || null;
  }

  public getTenantBySlug(slug: string): Tenant | null {
    return this.state.tenants.find((t) => t.slug === slug || t.subdomain === slug) || null;
  }

  public createTenant(data: Partial<Tenant>, user?: User | null): Tenant {
    const newTenant: Tenant = {
      id: generateId('tenant'),
      slug: slugify(data.slug || data.name || 'institusi-baru'),
      name: data.name || 'Institusi Baru',
      institutionType: data.institutionType || 'SMA',
      category: data.category || 'SEKOLAH',
      subdomain: slugify(data.subdomain || data.slug || data.name || 'institusi'),
      customDomain: data.customDomain,
      status: data.status || 'ACTIVE',
      logo: data.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop',
      bannerImage: data.bannerImage,
      npsnOrCode: data.npsnOrCode,
      email: data.email || 'info@institusi.sch.id',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      province: data.province || '',
      postalCode: data.postalCode || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.tenants.push(newTenant);

    // Otomatis buatkan setting default dan subscription FREE
    this.state.tenantSettings.push({
      id: generateId('ts'),
      tenantId: newTenant.id,
      accentColor: '#1d4ed8',
      enableStudentPortal: true,
      enableParentPortal: true,
      enableOnlinePPDB: true,
      enableAttendanceSync: true,
      defaultTimezone: 'Asia/Jakarta',
      allowTeacherDocumentApproval: false,
      maxUploadSizeMb: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.state.tenantSubscriptions.push({
      id: generateId('sub'),
      tenantId: newTenant.id,
      tier: 'FREE',
      startDate: new Date().toISOString(),
      status: 'ACTIVE',
      maxUsers: 50,
      maxStudents: 300,
      maxStorageMb: 2000,
      customDomainAllowed: false,
      apiAccessAllowed: false,
      whiteLabelAllowed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TENANT_CREATE',
      entity: 'TENANT',
      entityId: newTenant.id,
      details: `Mendaftarkan tenant institusi baru: ${newTenant.name} (${newTenant.institutionType})`,
    });

    this.saveState();
    return newTenant;
  }

  public updateTenant(id: string, data: Partial<Tenant>, user?: User | null): Tenant | null {
    const index = this.state.tenants.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.state.tenants[index] = {
      ...this.state.tenants[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TENANT_UPDATE',
      entity: 'TENANT',
      entityId: id,
      details: `Memperbarui profil tenant: ${this.state.tenants[index].name}`,
    });

    this.saveState();
    return this.state.tenants[index];
  }

  public deleteTenant(id: string, user?: User | null): boolean {
    const index = this.state.tenants.findIndex((t) => t.id === id);
    if (index === -1) return false;

    const tenantName = this.state.tenants[index].name;
    this.state.tenants.splice(index, 1);

    if (this.state.activeTenantId === id) {
      this.state.activeTenantId = this.state.tenants[0]?.id || '';
    }

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TENANT_DELETE',
      entity: 'TENANT',
      entityId: id,
      details: `Menghapus tenant institusi: ${tenantName}`,
    });

    this.saveState();
    return true;
  }

  /**
   * Pendaftaran Institusi Mandiri (Self-Service Onboarding)
   * Membuat Tenant baru, akun Administrator Sekolah, dan mensetup lingkungan akademik awal
   */
  public registerInstitution(input: {
    institutionName: string;
    slug?: string;
    institutionType?: string;
    type?: string;
    category?: 'SEKOLAH' | 'KAMPUS' | 'PONDOK' | 'LEMBAGA';
    npsnOrCode?: string;
    npsn?: string;
    subdomain?: string;
    email?: string;
    phone?: string;
    adminPhone?: string;
    address?: string;
    adminName: string;
    adminEmail: string;
    adminPassword?: string;
    password?: string;
    educationLevel?: string;
  }): {
    tenant: Tenant;
    user: User;
    adminUser: User;
    membership: TenantMembership;
    subscription: TenantSubscription;
    academicYear: AcademicYear;
  } {
    const targetSubdomain = input.subdomain || input.slug || slugify(input.institutionName);
    
    // Validasi subdomain unik
    const existing = this.state.tenants.find(
      (t) => t.subdomain === targetSubdomain || t.slug === targetSubdomain
    );
    if (existing) {
      throw new Error(`Subdomain "${targetSubdomain}" sudah digunakan oleh institusi lain.`);
    }

    const assignedType = input.institutionType || input.type || input.educationLevel || 'SMA';

    // 1. Buat Tenant
    const newTenant: Tenant = {
      id: generateId('tenant'),
      slug: targetSubdomain,
      name: input.institutionName,
      institutionType: assignedType,
      type: assignedType,
      category: input.category || (['UNIVERSITAS', 'POLITEKNIK', 'AKADEMI', 'INSTITUT'].includes(assignedType) ? 'KAMPUS' : 'SEKOLAH'),
      subdomain: targetSubdomain,
      status: 'ACTIVE',
      npsnOrCode: input.npsnOrCode || input.npsn,
      email: input.email || input.adminEmail,
      phone: input.phone || input.adminPhone || '',
      address: input.address || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.tenants.push(newTenant);

    // 2. Buat Subscription Free
    const newSub: TenantSubscription = {
      id: generateId('sub'),
      tenantId: newTenant.id,
      tier: 'FREE',
      plan: 'FREE',
      startDate: new Date().toISOString(),
      status: 'ACTIVE',
      maxUsers: 100,
      maxStudents: 500,
      maxStorageMb: 5000,
      customDomainAllowed: false,
      apiAccessAllowed: false,
      whiteLabelAllowed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.tenantSubscriptions.push(newSub);

    // 3. Buat Setting Tenant
    this.state.tenantSettings.push({
      id: generateId('ts'),
      tenantId: newTenant.id,
      accentColor: '#1d4ed8',
      enableStudentPortal: true,
      enableParentPortal: true,
      enableOnlinePPDB: true,
      enableAttendanceSync: true,
      defaultTimezone: 'Asia/Jakarta',
      allowTeacherDocumentApproval: false,
      maxUploadSizeMb: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 4. Buat Akun Admin Sekolah Utama
    const newAdminUser: User = {
      id: generateId('usr'),
      name: input.adminName,
      email: input.adminEmail,
      phone: input.adminPhone || input.phone,
      passwordHash: input.adminPassword || input.password || 'AdminSekolah123!',
      role: 'ADMIN_SEKOLAH',
      roles: ['ADMIN_SEKOLAH', 'ADMIN'],
      status: 'ACTIVE',
      isActive: true,
      tenantId: newTenant.id,
      tenantIds: [newTenant.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.users.push(newAdminUser);

    // 5. Tambahkan TenantMembership
    const newMembership: TenantMembership = {
      id: generateId('tm'),
      tenantId: newTenant.id,
      userId: newAdminUser.id,
      role: 'OWNER',
      roleCode: 'ADMIN_SEKOLAH',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.tenantMemberships.push(newMembership);

    // 6. Buatkan Tahun Ajaran Pertama (2026/2027)
    const newAy: AcademicYear = {
      id: generateId('ay'),
      tenantId: newTenant.id,
      name: '2026/2027',
      startDate: '2026-07-15T00:00:00Z',
      endDate: '2027-06-25T23:59:59Z',
      isActive: true,
      status: 'ACTIVE',
      notes: 'Tahun Ajaran Perdana Institusi Baru',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.academicYears.push(newAy);

    // Semester Ganjil
    this.state.academicTerms.push({
      id: generateId('term'),
      tenantId: newTenant.id,
      academicYearId: newAy.id,
      name: 'Semester Ganjil',
      termType: 'ODD',
      startDate: '2026-07-15T00:00:00Z',
      endDate: '2026-12-20T23:59:59Z',
      isActive: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update active tenant di store
    this.state.activeTenantId = newTenant.id;

    this.addAuditLog({
      userId: newAdminUser.id,
      userName: newAdminUser.name,
      userRole: 'ADMIN_SEKOLAH',
      action: 'INSTITUTION_REGISTERED',
      entity: 'TENANT',
      entityId: newTenant.id,
      details: `Pendaftaran mandiri institusi: ${newTenant.name} oleh ${newAdminUser.name} (${newAdminUser.email})`,
    });

    this.saveState();
    return {
      tenant: newTenant,
      user: newAdminUser,
      adminUser: newAdminUser,
      membership: newMembership,
      subscription: newSub,
      academicYear: newAy,
    };
  }

  public getTenantMemberships(tenantId?: string): TenantMembership[] {
    return tenantId
      ? this.state.tenantMemberships.filter((m) => m.tenantId === tenantId)
      : [...this.state.tenantMemberships];
  }

  public getTenantSubscription(tenantId: string): TenantSubscription | null {
    return this.state.tenantSubscriptions.find((s) => s.tenantId === tenantId) || null;
  }

  public getSubscription(tenantId: string): TenantSubscription | null {
    return this.getTenantSubscription(tenantId);
  }

  public updateTenantSubscription(
    tenantId: string,
    data: Partial<TenantSubscription>,
    user?: User | null
  ): TenantSubscription {
    const existingSub = this.state.tenantSubscriptions.find((s) => s.tenantId === tenantId);
    const sub: TenantSubscription = existingSub || {
      id: generateId('sub'),
      tenantId,
      tier: 'BASIC',
      plan: 'BASIC',
      startDate: new Date().toISOString(),
      status: 'ACTIVE',
      maxUsers: 100,
      maxStudents: 500,
      maxStorageMb: 5000,
      customDomainAllowed: false,
      apiAccessAllowed: false,
      whiteLabelAllowed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!existingSub) {
      this.state.tenantSubscriptions.push(sub);
    }

    Object.assign(sub, data, { updatedAt: new Date().toISOString() });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'SUBSCRIPTION_UPDATE',
      entity: 'SUBSCRIPTION',
      entityId: sub.id,
      details: `Memperbarui paket langganan tenant ${tenantId} menjadi ${sub.tier || sub.plan}`,
    });

    this.saveState();
    return sub;
  }

  public updateSubscription(
    tenantId: string,
    data: any,
    user?: User | null
  ): TenantSubscription {
    const tier = data.tier || data.plan || 'PROFESSIONAL';
    return this.updateTenantSubscription(
      tenantId,
      {
        ...data,
        tier,
        plan: tier,
      },
      user
    );
  }

  public getTenantUsage(tenantId: string): TenantUsage | null {
    return this.state.tenantUsages.find((u) => u.tenantId === tenantId) || null;
  }

  public getTenantSetting(tenantId: string): TenantSetting | null {
    return this.state.tenantSettings.find((s) => s.tenantId === tenantId) || null;
  }

  public updateTenantSetting(
    tenantId: string,
    data: Partial<TenantSetting>,
    user?: User | null
  ): TenantSetting {
    const existingSetting = this.state.tenantSettings.find((s) => s.tenantId === tenantId);
    const setting: TenantSetting = existingSetting || {
      id: generateId('ts'),
      tenantId,
      accentColor: '#1d4ed8',
      enableStudentPortal: true,
      enableParentPortal: true,
      enableOnlinePPDB: true,
      enableAttendanceSync: true,
      defaultTimezone: 'Asia/Jakarta',
      allowTeacherDocumentApproval: false,
      maxUploadSizeMb: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!existingSetting) {
      this.state.tenantSettings.push(setting);
    }

    Object.assign(setting, data, { updatedAt: new Date().toISOString() });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TENANT_SETTING_UPDATE',
      entity: 'TENANT_SETTING',
      entityId: setting.id,
      details: `Memperbarui konfigurasi sistem tenant ${tenantId}`,
    });

    this.saveState();
    return setting;
  }

  // ===========================================================================
  // TAHUN AJARAN & SEMESTER (ACADEMIC CALENDAR & PERIODS)
  // ===========================================================================

  public getAcademicYears(tenantId?: string): AcademicYear[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.academicYears.filter((ay) => !ay.tenantId || ay.tenantId === tId);
  }

  public getActiveAcademicYear(tenantId?: string): AcademicYear | null {
    const years = this.getAcademicYears(tenantId);
    return years.find((y) => y.isActive) || years[0] || null;
  }

  public createAcademicYear(
    data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): AcademicYear {
    const newAy: AcademicYear = {
      ...data,
      id: generateId('ay'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newAy.isActive) {
      // Nonaktifkan tahun ajaran lain dalam tenant yang sama
      this.state.academicYears
        .filter((y) => y.tenantId === newAy.tenantId)
        .forEach((y) => {
          y.isActive = false;
        });
    }

    this.state.academicYears.push(newAy);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ACADEMIC_YEAR_CREATE',
      entity: 'ACADEMIC_YEAR',
      entityId: newAy.id,
      details: `Menambah tahun ajaran baru: ${newAy.name}`,
    });

    this.saveState();
    return newAy;
  }

  public updateAcademicYear(
    id: string,
    data: Partial<AcademicYear>,
    user?: User | null
  ): AcademicYear | null {
    const index = this.state.academicYears.findIndex((y) => y.id === id);
    if (index === -1) return null;

    const current = this.state.academicYears[index];

    if (data.isActive) {
      this.state.academicYears
        .filter((y) => y.tenantId === current.tenantId && y.id !== id)
        .forEach((y) => {
          y.isActive = false;
        });
    }

    this.state.academicYears[index] = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ACADEMIC_YEAR_UPDATE',
      entity: 'ACADEMIC_YEAR',
      entityId: id,
      details: `Memperbarui status tahun ajaran: ${this.state.academicYears[index].name}`,
    });

    this.saveState();
    return this.state.academicYears[index];
  }

  public setActiveAcademicYear(id: string, tenantId?: string, user?: User | null): AcademicYear | null {
    const tId = tenantId || this.getActiveTenantId();
    let activatedYear: AcademicYear | null = null;
    this.state.academicYears
      .filter((y) => y.tenantId === tId)
      .forEach((y) => {
        y.isActive = y.id === id;
        if (y.id === id) {
          y.status = 'ACTIVE';
          activatedYear = y;
        }
      });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ACADEMIC_YEAR_ACTIVATE',
      entity: 'ACADEMIC_YEAR',
      entityId: id,
      details: `Mengaktifkan tahun ajaran aktif platform: ${id}`,
    });

    this.saveState();
    return activatedYear;
  }

  public closeAcademicYear(id: string, user?: User | null) {
    const year = this.state.academicYears.find((y) => y.id === id);
    if (year) {
      year.isActive = false;
      year.status = 'CLOSED';
      year.updatedAt = new Date().toISOString();

      this.addAuditLog({
        userId: user?.id,
        userName: user?.name,
        userRole: user?.role,
        action: 'ACADEMIC_YEAR_CLOSE',
        entity: 'ACADEMIC_YEAR',
        entityId: id,
        details: `Menutup secara resmi tahun ajaran: ${year.name}`,
      });

      this.saveState();
    }
  }

  public getAcademicTerms(tenantId?: string, academicYearId?: string): AcademicTerm[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.academicTerms.filter((term) => {
      const matchTenant = !term.tenantId || term.tenantId === tId;
      const matchAy = academicYearId ? term.academicYearId === academicYearId : true;
      return matchTenant && matchAy;
    });
  }

  public getActiveAcademicTerm(tenantId?: string): AcademicTerm | null {
    const terms = this.getAcademicTerms(tenantId);
    return terms.find((t) => t.isActive) || terms[0] || null;
  }

  public createAcademicTerm(
    data: Omit<AcademicTerm, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): AcademicTerm {
    const newTerm: AcademicTerm = {
      ...data,
      id: generateId('term'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newTerm.isActive) {
      this.state.academicTerms
        .filter((t) => t.tenantId === newTerm.tenantId)
        .forEach((t) => {
          t.isActive = false;
        });
    }

    this.state.academicTerms.push(newTerm);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ACADEMIC_TERM_CREATE',
      entity: 'ACADEMIC_TERM',
      entityId: newTerm.id,
      details: `Membuat semester baru: ${newTerm.name}`,
    });

    this.saveState();
    return newTerm;
  }

  public updateAcademicTerm(
    id: string,
    data: Partial<AcademicTerm>,
    user?: User | null
  ): AcademicTerm | null {
    const index = this.state.academicTerms.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = this.state.academicTerms[index];

    if (data.isActive) {
      this.state.academicTerms
        .filter((t) => t.tenantId === current.tenantId && t.id !== id)
        .forEach((t) => {
          t.isActive = false;
        });
    }

    this.state.academicTerms[index] = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.academicTerms[index];
  }

  public setActiveAcademicTerm(id: string, tenantId?: string, user?: User | null): AcademicTerm | null {
    const tId = tenantId || this.getActiveTenantId();
    let activatedTerm: AcademicTerm | null = null;
    this.state.academicTerms
      .filter((t) => t.tenantId === tId)
      .forEach((t) => {
        t.isActive = t.id === id;
        if (t.id === id) {
          t.status = 'ACTIVE';
          activatedTerm = t;
        }
      });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ACADEMIC_TERM_ACTIVATE',
      entity: 'ACADEMIC_TERM',
      entityId: id,
      details: `Mengaktifkan semester aktif: ${id}`,
    });

    this.saveState();
    return activatedTerm;
  }

  // ===========================================================================
  // STRUKTUR PENDIDIKAN & SARANA BELAJAR (RUANG, PRODI, KELAS)
  // ===========================================================================

  public getFaculties(tenantId?: string): Faculty[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.faculties.filter((f) => !f.tenantId || f.tenantId === tId);
  }

  public createFaculty(data: Omit<Faculty, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): Faculty {
    const faculty: Faculty = {
      ...data,
      id: generateId('fac'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.faculties.push(faculty);
    this.saveState();
    return faculty;
  }

  public updateFaculty(id: string, data: Partial<Faculty>, user?: User | null): Faculty | null {
    const index = this.state.faculties.findIndex((f) => f.id === id);
    if (index === -1) return null;
    this.state.faculties[index] = { ...this.state.faculties[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.faculties[index];
  }

  public deleteFaculty(id: string, user?: User | null): boolean {
    const index = this.state.faculties.findIndex((f) => f.id === id);
    if (index === -1) return false;
    this.state.faculties.splice(index, 1);
    this.saveState();
    return true;
  }

  public getDepartments(tenantId?: string, facultyId?: string): Department[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.departments.filter((d) => {
      const matchTenant = !d.tenantId || d.tenantId === tId;
      const matchFaculty = facultyId ? d.facultyId === facultyId : true;
      return matchTenant && matchFaculty;
    });
  }

  public createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): Department {
    const dept: Department = {
      ...data,
      id: generateId('dept'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.departments.push(dept);
    this.saveState();
    return dept;
  }

  public updateDepartment(id: string, data: Partial<Department>, user?: User | null): Department | null {
    const index = this.state.departments.findIndex((d) => d.id === id);
    if (index === -1) return null;
    this.state.departments[index] = { ...this.state.departments[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.departments[index];
  }

  public deleteDepartment(id: string, user?: User | null): boolean {
    const index = this.state.departments.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.state.departments.splice(index, 1);
    this.saveState();
    return true;
  }

  public getStudyPrograms(tenantId?: string): StudyProgram[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.studyPrograms.filter((p) => !p.tenantId || p.tenantId === tId);
  }

  public createStudyProgram(data: Omit<StudyProgram, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): StudyProgram {
    const prog: StudyProgram = {
      ...data,
      id: generateId('prog'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.studyPrograms.push(prog);
    this.saveState();
    return prog;
  }

  public updateStudyProgram(id: string, data: Partial<StudyProgram>, user?: User | null): StudyProgram | null {
    const index = this.state.studyPrograms.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.state.studyPrograms[index] = { ...this.state.studyPrograms[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.studyPrograms[index];
  }

  public deleteStudyProgram(id: string, user?: User | null): boolean {
    const index = this.state.studyPrograms.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.state.studyPrograms.splice(index, 1);
    this.saveState();
    return true;
  }

  public getGradeLevels(tenantId?: string): GradeLevel[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.gradeLevels
      .filter((g) => !g.tenantId || g.tenantId === tId)
      .sort((a, b) => ((a.sequence ?? a.sequenceNumber ?? 0) - (b.sequence ?? b.sequenceNumber ?? 0)));
  }

  public createGradeLevel(data: Omit<GradeLevel, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): GradeLevel {
    const gl: GradeLevel = {
      ...data,
      id: generateId('gl'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.gradeLevels.push(gl);
    this.saveState();
    return gl;
  }

  public updateGradeLevel(id: string, data: Partial<GradeLevel>, user?: User | null): GradeLevel | null {
    const index = this.state.gradeLevels.findIndex((g) => g.id === id);
    if (index === -1) return null;
    this.state.gradeLevels[index] = { ...this.state.gradeLevels[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.gradeLevels[index];
  }

  public deleteGradeLevel(id: string, user?: User | null): boolean {
    const index = this.state.gradeLevels.findIndex((g) => g.id === id);
    if (index === -1) return false;
    this.state.gradeLevels.splice(index, 1);
    this.saveState();
    return true;
  }

  public getAcademicClasses(tenantId?: string, academicYearId?: string): AcademicClass[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.academicClasses.filter((c) => {
      const matchTenant = !c.tenantId || c.tenantId === tId;
      const matchYear = academicYearId ? c.academicYearId === academicYearId : true;
      return matchTenant && matchYear;
    });
  }

  public getAcademicClassById(id: string): AcademicClass | null {
    return this.state.academicClasses.find((c) => c.id === id) || null;
  }

  public createAcademicClass(data: Omit<AcademicClass, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): AcademicClass {
    const newClass: AcademicClass = {
      ...data,
      id: generateId('cls'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.academicClasses.push(newClass);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ACADEMIC_CLASS_CREATE',
      entity: 'ACADEMIC_CLASS',
      entityId: newClass.id,
      details: `Menambah rombel kelas: ${newClass.name} (${newClass.code})`,
    });

    this.saveState();
    return newClass;
  }

  public updateAcademicClass(id: string, data: Partial<AcademicClass>, user?: User | null): AcademicClass | null {
    const index = this.state.academicClasses.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.state.academicClasses[index] = { ...this.state.academicClasses[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.academicClasses[index];
  }

  public deleteAcademicClass(id: string, user?: User | null): boolean {
    const index = this.state.academicClasses.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.state.academicClasses.splice(index, 1);
    this.saveState();
    return true;
  }

  public getRooms(tenantId?: string): Room[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.rooms.filter((r) => !r.tenantId || r.tenantId === tId);
  }

  public createRoom(data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): Room {
    const room: Room = {
      ...data,
      id: generateId('room'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.rooms.push(room);
    this.saveState();
    return room;
  }

  public updateRoom(id: string, data: Partial<Room>, user?: User | null): Room | null {
    const index = this.state.rooms.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.state.rooms[index] = { ...this.state.rooms[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.rooms[index];
  }

  public deleteRoom(id: string, user?: User | null): boolean {
    const index = this.state.rooms.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.state.rooms.splice(index, 1);
    this.saveState();
    return true;
  }

  // ===========================================================================
  // MATA PELAJARAN, KURIKULUM & BEBAN MENGAJAR
  // ===========================================================================

  public getSubjects(tenantId?: string): Subject[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.subjects.filter((s) => !s.tenantId || s.tenantId === tId);
  }

  public createSubject(data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): Subject {
    const subject: Subject = {
      ...data,
      id: generateId('subj'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.subjects.push(subject);
    this.saveState();
    return subject;
  }

  public updateSubject(id: string, data: Partial<Subject>, user?: User | null): Subject | null {
    const index = this.state.subjects.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.state.subjects[index] = { ...this.state.subjects[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.subjects[index];
  }

  public deleteSubject(id: string, user?: User | null): boolean {
    const index = this.state.subjects.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.state.subjects.splice(index, 1);
    this.saveState();
    return true;
  }

  public getCurriculums(tenantId?: string): Curriculum[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.curriculums.filter((c) => !c.tenantId || c.tenantId === tId);
  }

  public createCurriculum(data: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt'>, user?: User | null): Curriculum {
    const curr: Curriculum = {
      ...data,
      id: generateId('curr'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.curriculums.push(curr);
    this.saveState();
    return curr;
  }

  public updateCurriculum(id: string, data: Partial<Curriculum>, user?: User | null): Curriculum | null {
    const index = this.state.curriculums.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.state.curriculums[index] = { ...this.state.curriculums[index], ...data, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.curriculums[index];
  }

  public deleteCurriculum(id: string, user?: User | null): boolean {
    const index = this.state.curriculums.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.state.curriculums.splice(index, 1);
    this.saveState();
    return true;
  }

  public getCurriculumSubjects(curriculumId: string): CurriculumSubject[] {
    return this.state.curriculumSubjects.filter((cs) => cs.curriculumId === curriculumId);
  }

  public saveCurriculumSubject(data: Omit<CurriculumSubject, 'id' | 'createdAt'>): CurriculumSubject {
    const existingIndex = this.state.curriculumSubjects.findIndex(
      (cs) => cs.curriculumId === data.curriculumId && cs.subjectId === data.subjectId
    );

    if (existingIndex !== -1) {
      this.state.curriculumSubjects[existingIndex] = {
        ...this.state.curriculumSubjects[existingIndex],
        ...data,
      };
      this.saveState();
      return this.state.curriculumSubjects[existingIndex];
    }

    const newCs: CurriculumSubject = {
      ...data,
      id: generateId('cs'),
      createdAt: new Date().toISOString(),
    };
    this.state.curriculumSubjects.push(newCs);
    this.saveState();
    return newCs;
  }

  public getTeachingAssignments(
    tenantId?: string,
    academicYearId?: string,
    teacherId?: string
  ): TeachingAssignment[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.teachingAssignments.filter((ta) => {
      const matchTenant = !ta.tenantId || ta.tenantId === tId;
      const matchYear = academicYearId ? ta.academicYearId === academicYearId : true;
      const matchTeacher = teacherId ? ta.teacherId === teacherId : true;
      return matchTenant && matchYear && matchTeacher;
    });
  }

  public createTeachingAssignment(
    data: Omit<TeachingAssignment, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): TeachingAssignment {
    const assignment: TeachingAssignment = {
      ...data,
      id: generateId('ta'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.teachingAssignments.push(assignment);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'TEACHING_ASSIGNMENT_CREATE',
      entity: 'TEACHING_ASSIGNMENT',
      entityId: assignment.id,
      details: `Menugaskan ${assignment.teacherName} mengampu ${assignment.subjectName} di ${assignment.className}`,
    });

    this.saveState();
    return assignment;
  }

  public updateTeachingAssignment(
    id: string,
    data: Partial<TeachingAssignment>,
    user?: User | null
  ): TeachingAssignment | null {
    const index = this.state.teachingAssignments.findIndex((ta) => ta.id === id);
    if (index === -1) return null;
    this.state.teachingAssignments[index] = {
      ...this.state.teachingAssignments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.teachingAssignments[index];
  }

  public deleteTeachingAssignment(id: string, user?: User | null): boolean {
    const index = this.state.teachingAssignments.findIndex((ta) => ta.id === id);
    if (index === -1) return false;
    this.state.teachingAssignments.splice(index, 1);
    this.saveState();
    return true;
  }

  public getTeacherWorkload(
    teacherId: string,
    academicYearId?: string,
    tenantId?: string
  ): {
    totalHours: number;
    assignments: TeachingAssignment[];
    isWorkloadStandardMet: boolean; // Standar 24 Jam Mengajar Kemendikbudristek
  } {
    const assignments = this.getTeachingAssignments(tenantId, academicYearId, teacherId);
    const totalHours = assignments.reduce((acc, curr) => acc + (curr.hoursPerWeek || 0), 0);
    return {
      totalHours,
      assignments,
      isWorkloadStandardMet: totalHours >= 24,
    };
  }

  public getTeacherTotalHours(teacherId: string, academicYearId?: string, tenantId?: string): number {
    return this.getTeacherWorkload(teacherId, academicYearId, tenantId).totalHours;
  }

  // ===========================================================================
  // JADWAL PELAJARAN & DETEKSI KONFLIK WAKTU NYATA (3-WAY CONFLICT ENGINE)
  // ===========================================================================

  public getScheduleItems(filter?: {
    tenantId?: string;
    academicYearId?: string;
    academicTermId?: string;
    classId?: string;
    teacherId?: string;
    roomId?: string;
    dayOfWeek?: number;
  }): ScheduleItem[] {
    const tId = filter?.tenantId || this.getActiveTenantId();
    return this.state.scheduleItems.filter((item) => {
      if (item.tenantId && item.tenantId !== tId) return false;
      if (filter?.academicYearId && item.academicYearId !== filter.academicYearId) return false;
      if (filter?.academicTermId && item.academicTermId !== filter.academicTermId) return false;
      if (filter?.classId && item.classId !== filter.classId) return false;
      if (filter?.teacherId && item.teacherId !== filter.teacherId) return false;
      if (filter?.roomId && item.roomId !== filter.roomId) return false;
      if (filter?.dayOfWeek && item.dayOfWeek !== filter.dayOfWeek) return false;
      return true;
    });
  }

  /**
   * Engine Validasi Bentrok Jadwal 3 Dimensi:
   * 1. Konflik Guru: Guru yang sama mengajar di 2 kelas berbeda pada jam dan hari yang bertabrakan.
   * 2. Konflik Kelas: Kelas/rombel yang sama memiliki 2 sesi mata pelajaran bersamaan.
   * 3. Konflik Ruangan: Ruangan/laboratorium yang sama dipakai oleh 2 rombel berbeda pada jam bertabrakan.
   */
  public checkScheduleConflict(
    scheduleData: {
      tenantId?: string;
      academicYearId: string;
      academicTermId: string;
      dayOfWeek: number;
      startTime: string; // "07:30"
      endTime: string;   // "09:00"
      teacherId: string;
      classId: string;
      roomId?: string;
    },
    excludeId?: string
  ): { hasConflict: boolean; reason?: string; conflictingItem?: ScheduleItem } {
    const parseMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const targetStart = parseMinutes(scheduleData.startTime);
    const targetEnd = parseMinutes(scheduleData.endTime);
    const targetTenantId = scheduleData.tenantId || this.getActiveTenantId();

    const existingItems = this.state.scheduleItems.filter((item) => {
      if (excludeId && item.id === excludeId) return false;
      if (item.tenantId && item.tenantId !== targetTenantId) return false;
      if (item.academicYearId !== scheduleData.academicYearId) return false;
      if (item.academicTermId !== scheduleData.academicTermId) return false;
      if (item.dayOfWeek !== scheduleData.dayOfWeek) return false;
      return true;
    });

    for (const item of existingItems) {
      const itemStart = parseMinutes(item.startTime);
      const itemEnd = parseMinutes(item.endTime);

      // Cek overlap waktu: Max(Start1, Start2) < Min(End1, End2)
      const hasOverlap = Math.max(targetStart, itemStart) < Math.min(targetEnd, itemEnd);

      if (hasOverlap) {
        // 1. Cek Bentrok Guru
        if (item.teacherId === scheduleData.teacherId) {
          return {
            hasConflict: true,
            reason: `Bentrok Guru: ${item.teacherName} telah dijadwalkan mengajar ${item.subjectName} di kelas ${item.className} pada jam ${item.startTime}-${item.endTime}`,
            conflictingItem: item,
          };
        }

        // 2. Cek Bentrok Kelas
        if (item.classId === scheduleData.classId) {
          return {
            hasConflict: true,
            reason: `Bentrok Rombel: Kelas ${item.className} telah memiliki jadwal mata pelajaran ${item.subjectName} pada jam ${item.startTime}-${item.endTime}`,
            conflictingItem: item,
          };
        }

        // 3. Cek Bentrok Ruangan
        if (scheduleData.roomId && item.roomId && item.roomId === scheduleData.roomId) {
          return {
            hasConflict: true,
            reason: `Bentrok Ruang Belajar: Ruang ${item.roomCode || 'terpilih'} sedang digunakan oleh kelas ${item.className} (${item.subjectName}) pada jam ${item.startTime}-${item.endTime}`,
            conflictingItem: item,
          };
        }
      }
    }

    return { hasConflict: false };
  }

  public createScheduleItem(
    data: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): ScheduleItem {
    const conflict = this.checkScheduleConflict(data);
    if (conflict.hasConflict) {
      throw new Error(conflict.reason || 'Terjadi bentrok jadwal pembelajaran.');
    }

    const newItem: ScheduleItem = {
      ...data,
      id: generateId('sch'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.scheduleItems.push(newItem);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'SCHEDULE_CREATE',
      entity: 'SCHEDULE_ITEM',
      entityId: newItem.id,
      details: `Menyusun jadwal: ${newItem.subjectName} (${newItem.className}) Hari ke-${newItem.dayOfWeek} ${newItem.startTime}-${newItem.endTime}`,
    });

    this.saveState();
    return newItem;
  }

  public updateScheduleItem(
    id: string,
    data: Partial<ScheduleItem>,
    user?: User | null
  ): ScheduleItem | null {
    const index = this.state.scheduleItems.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const merged = { ...this.state.scheduleItems[index], ...data };
    const conflict = this.checkScheduleConflict(merged, id);
    if (conflict.hasConflict) {
      throw new Error(conflict.reason || 'Pembaruan jadwal menghasilkan bentrok alokasi waktu.');
    }

    this.state.scheduleItems[index] = {
      ...merged,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.scheduleItems[index];
  }

  public deleteScheduleItem(id: string, user?: User | null): boolean {
    const index = this.state.scheduleItems.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.state.scheduleItems.splice(index, 1);
    this.saveState();
    return true;
  }

  // ===========================================================================
  // DOKUMEN PEMBELAJARAN (SILABUS, RPP, MODUL AJAR, RPS)
  // ===========================================================================

  public getLearningDocuments(
    tenantId?: string,
    filter?: { authorId?: string; status?: string; subjectId?: string }
  ): LearningDocument[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.learningDocuments.filter((doc) => {
      if (doc.tenantId && doc.tenantId !== tId) return false;
      if (filter?.authorId && doc.authorId !== filter.authorId) return false;
      if (filter?.status && doc.status !== filter.status) return false;
      if (filter?.subjectId && doc.subjectId !== filter.subjectId) return false;
      return true;
    });
  }

  public createLearningDocument(
    data: Omit<LearningDocument, 'id' | 'version' | 'status' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): LearningDocument {
    const newDoc: LearningDocument = {
      ...data,
      id: generateId('ld'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      version: 1,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.learningDocuments.push(newDoc);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'LEARNING_DOC_CREATE',
      entity: 'LEARNING_DOCUMENT',
      entityId: newDoc.id,
      details: `Menyusun dokumen pembelajaran baru: ${newDoc.title} (${newDoc.documentType})`,
    });

    this.saveState();
    return newDoc;
  }

  public updateLearningDocument(
    id: string,
    data: Partial<LearningDocument>,
    user?: User | null
  ): LearningDocument | null {
    const index = this.state.learningDocuments.findIndex((d) => d.id === id);
    if (index === -1) return null;

    this.state.learningDocuments[index] = {
      ...this.state.learningDocuments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.learningDocuments[index];
  }

  public deleteLearningDocument(id: string, user?: User | null): boolean {
    const index = this.state.learningDocuments.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.state.learningDocuments.splice(index, 1);
    this.saveState();
    return true;
  }

  public submitLearningDocument(id: string, user?: User | null): LearningDocument | null {
    const doc = this.state.learningDocuments.find((d) => d.id === id);
    if (!doc) return null;

    doc.status = 'SUBMITTED';
    doc.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'LEARNING_DOC_SUBMIT',
      entity: 'LEARNING_DOCUMENT',
      entityId: id,
      details: `Mengajukan verifikasi dokumen: ${doc.title}`,
    });

    this.saveState();
    return doc;
  }

  public approveLearningDocument(
    id: string,
    reviewerOrTenant: User | string,
    reviewerId?: string,
    reviewerName?: string
  ): LearningDocument | null {
    const doc = this.state.learningDocuments.find((d) => d.id === id);
    if (!doc) return null;

    const revId = typeof reviewerOrTenant === 'object' ? reviewerOrTenant.id : (reviewerId || 'admin-1');
    const revName = typeof reviewerOrTenant === 'object' ? reviewerOrTenant.name : (reviewerName || reviewerId || 'Kepala Sekolah / Kurikulum');
    const now = new Date().toISOString();

    doc.status = 'APPROVED';
    doc.reviewedById = revId;
    doc.reviewedByName = revName;
    doc.approvedBy = revName;
    doc.approvedAt = now;
    doc.reviewedAt = now;
    doc.revisionNotes = undefined;
    doc.feedbackNotes = undefined;
    doc.updatedAt = now;

    this.addAuditLog({
      userId: revId,
      userName: revName,
      action: 'LEARNING_DOC_APPROVE',
      entity: 'LEARNING_DOCUMENT',
      entityId: id,
      details: `Menyetujui dokumen pembelajaran: ${doc.title}`,
    });

    this.saveState();
    return doc;
  }

  public requestRevisionLearningDocument(
    id: string,
    reviewerOrTenant: User | string,
    revisionNotesOrTenant?: string,
    revisionNotesParam?: string
  ): LearningDocument | null {
    const doc = this.state.learningDocuments.find((d) => d.id === id);
    if (!doc) return null;

    let revId = 'reviewer-1';
    let revName = 'Kepala Sekolah / Kurikulum';
    let notes = '';

    if (typeof reviewerOrTenant === 'object') {
      revId = reviewerOrTenant.id;
      revName = reviewerOrTenant.name;
      notes = revisionNotesOrTenant || '';
    } else {
      notes = revisionNotesParam || revisionNotesOrTenant || '';
    }

    const now = new Date().toISOString();
    doc.status = 'REVISION';
    doc.reviewedById = revId;
    doc.reviewedByName = revName;
    doc.reviewedAt = now;
    doc.revisionNotes = notes;
    doc.feedbackNotes = notes;
    doc.updatedAt = now;

    this.addAuditLog({
      userId: revId,
      userName: revName,
      action: 'LEARNING_DOC_REVISION',
      entity: 'LEARNING_DOCUMENT',
      entityId: id,
      details: `Meminta revisi dokumen: ${doc.title}. Catatan: ${notes}`,
    });

    this.saveState();
    return doc;
  }

  // ===========================================================================
  // KALENDER AKADEMIK INSTITUSI
  // ===========================================================================

  public getAcademicCalendarEvents(tenantId?: string, academicYearId?: string): AcademicCalendarEvent[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.state.academicCalendarEvents
      .filter((ev) => {
        const matchTenant = !ev.tenantId || ev.tenantId === tId;
        const matchYear = academicYearId ? ev.academicYearId === academicYearId : true;
        return matchTenant && matchYear;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  public createAcademicCalendarEvent(
    data: Omit<AcademicCalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): AcademicCalendarEvent {
    const event: AcademicCalendarEvent = {
      ...data,
      id: generateId('ace'),
      tenantId: data.tenantId || this.getActiveTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.academicCalendarEvents.push(event);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'CALENDAR_EVENT_CREATE',
      entity: 'CALENDAR_EVENT',
      entityId: event.id,
      details: `Menambah agenda kalender akademik: ${event.title}`,
    });

    this.saveState();
    return event;
  }

  public updateAcademicCalendarEvent(
    id: string,
    data: Partial<AcademicCalendarEvent>,
    user?: User | null
  ): AcademicCalendarEvent | null {
    const index = this.state.academicCalendarEvents.findIndex((ev) => ev.id === id);
    if (index === -1) return null;
    this.state.academicCalendarEvents[index] = {
      ...this.state.academicCalendarEvents[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.academicCalendarEvents[index];
  }

  public deleteAcademicCalendarEvent(id: string, user?: User | null): boolean {
    const index = this.state.academicCalendarEvents.findIndex((ev) => ev.id === id);
    if (index === -1) return false;
    this.state.academicCalendarEvents.splice(index, 1);
    this.saveState();
    return true;
  }

  public resetToSeed(user?: User | null) {
    this.state = {
      settings: { ...INITIAL_SITE_SETTINGS },
      users: [...INITIAL_USERS],
      roles: [...INITIAL_ROLES],
      categories: [...INITIAL_CATEGORIES],
      tags: [...INITIAL_TAGS],
      posts: [...INITIAL_POSTS],
      pages: [...INITIAL_PAGES],
      announcements: [...INITIAL_ANNOUNCEMENTS],
      events: [...INITIAL_EVENTS],
      galleryAlbums: [...INITIAL_GALLERY_ALBUMS],
      galleryPhotos: [...INITIAL_GALLERY_PHOTOS],
      menus: [...INITIAL_MENUS],
      comments: [...INITIAL_COMMENTS],
      media: [...INITIAL_MEDIA],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      teacherProfiles: [...INITIAL_TEACHER_PROFILES],
      studentProfiles: [...INITIAL_STUDENT_PROFILES],
      parentProfiles: [...INITIAL_PARENT_PROFILES],
      studentParents: [...INITIAL_STUDENT_PARENTS],
      staffProfiles: [...INITIAL_STAFF_PROFILES],
      homeroomAssignments: [...INITIAL_HOMEROOM_ASSIGNMENTS],
      invitations: [...INITIAL_INVITATIONS],
      loginHistories: [...INITIAL_LOGIN_HISTORIES],
      passwordResetTokens: [],
      // Phase 4 defaults
      activeTenantId: 'tenant-sman-nusantara',
      tenants: [...INITIAL_TENANTS],
      tenantDomains: [...INITIAL_TENANT_DOMAINS],
      tenantMemberships: [...INITIAL_TENANT_MEMBERSHIPS],
      tenantSettings: [...INITIAL_TENANT_SETTINGS],
      tenantSubscriptions: [...INITIAL_TENANT_SUBSCRIPTIONS],
      tenantUsages: [...INITIAL_TENANT_USAGES],
      academicYears: [...INITIAL_ACADEMIC_YEARS],
      academicTerms: [...INITIAL_ACADEMIC_TERMS],
      faculties: [...INITIAL_FACULTIES],
      departments: [...INITIAL_DEPARTMENTS],
      studyPrograms: [...INITIAL_STUDY_PROGRAMS],
      gradeLevels: [...INITIAL_GRADE_LEVELS],
      academicClasses: [...INITIAL_ACADEMIC_CLASSES],
      rooms: [...INITIAL_ROOMS],
      subjects: [...INITIAL_SUBJECTS],
      curriculums: [...INITIAL_CURRICULUMS],
      curriculumSubjects: [...INITIAL_CURRICULUM_SUBJECTS],
      teachingAssignments: [...INITIAL_TEACHING_ASSIGNMENTS],
      scheduleItems: [...INITIAL_SCHEDULE_ITEMS],
      learningDocuments: [...INITIAL_LEARNING_DOCUMENTS],
      academicCalendarEvents: [...INITIAL_ACADEMIC_CALENDAR_EVENTS],
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'SYSTEM_RESET_SEED',
      entity: 'SYSTEM',
      details: 'Mengembalikan seluruh data CMS ke seed bawaan Phase 4 Multi-Tenant & Akademik',
    });

    this.saveState();
  }
}

export const cmsStore = new CmsStore();
