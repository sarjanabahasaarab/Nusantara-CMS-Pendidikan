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
  AttendanceSession,
  StudentAttendance,
  StaffAttendance,
  LeaveRequest,
  LeaveRequestStatus,
  AssessmentComponent,
  StudentAssessment,
  GradeRevision,
  QuestionBank,
  Question,
  Examination,
  ExamStatus,
  ExamSubmission,
  ReportCard,
  ReportCardStatus,
  ReportCardItem,
  KHSItem,
  SemesterResult,
  UniversityTranscript,
  AcademicDecision,
  Notification,
  AttendanceType,
  ExamAnswer,
  GradeLetter,
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
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_STUDENT_ATTENDANCES,
  INITIAL_STAFF_ATTENDANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ASSESSMENT_COMPONENTS,
  INITIAL_STUDENT_ASSESSMENTS,
  INITIAL_GRADE_REVISIONS,
  INITIAL_QUESTION_BANKS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMINATIONS,
  INITIAL_EXAM_SUBMISSIONS,
  INITIAL_REPORT_CARDS,
  INITIAL_SEMESTER_RESULTS,
  INITIAL_UNIVERSITY_TRANSCRIPTS,
  INITIAL_ACADEMIC_DECISIONS,
  INITIAL_NOTIFICATIONS,
} from './initialData';
import { generateId, slugify } from '../utils';

const STORAGE_KEY = 'nusantara_cms_db_v5';

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
  // Phase 5 Absensi, Penilaian, Ujian, Rapor
  attendanceSessions: AttendanceSession[];
  studentAttendances: StudentAttendance[];
  staffAttendances: StaffAttendance[];
  leaveRequests: LeaveRequest[];
  assessmentComponents: AssessmentComponent[];
  studentAssessments: StudentAssessment[];
  gradeRevisions: GradeRevision[];
  questionBanks: QuestionBank[];
  questions: Question[];
  examinations: Examination[];
  examSubmissions: ExamSubmission[];
  reportCards: ReportCard[];
  semesterResults: SemesterResult[];
  universityTranscripts: UniversityTranscript[];
  academicDecisions: AcademicDecision[];
  notifications: Notification[];
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
      // Phase 5 defaults
      attendanceSessions: [...INITIAL_ATTENDANCE_SESSIONS],
      studentAttendances: [...INITIAL_STUDENT_ATTENDANCES],
      staffAttendances: [...INITIAL_STAFF_ATTENDANCES],
      leaveRequests: [...INITIAL_LEAVE_REQUESTS],
      assessmentComponents: [...INITIAL_ASSESSMENT_COMPONENTS],
      studentAssessments: [...INITIAL_STUDENT_ASSESSMENTS],
      gradeRevisions: [...INITIAL_GRADE_REVISIONS],
      questionBanks: [...INITIAL_QUESTION_BANKS],
      questions: [...INITIAL_QUESTIONS],
      examinations: [...INITIAL_EXAMINATIONS],
      examSubmissions: [...INITIAL_EXAM_SUBMISSIONS],
      reportCards: [...INITIAL_REPORT_CARDS],
      semesterResults: [...INITIAL_SEMESTER_RESULTS],
      universityTranscripts: [...INITIAL_UNIVERSITY_TRANSCRIPTS],
      academicDecisions: [...INITIAL_ACADEMIC_DECISIONS],
      notifications: [...INITIAL_NOTIFICATIONS],
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
          // Phase 5 saved state
          attendanceSessions: parsed.attendanceSessions || defaultState.attendanceSessions,
          studentAttendances: parsed.studentAttendances || defaultState.studentAttendances,
          staffAttendances: parsed.staffAttendances || defaultState.staffAttendances,
          leaveRequests: parsed.leaveRequests || defaultState.leaveRequests,
          assessmentComponents: parsed.assessmentComponents || defaultState.assessmentComponents,
          studentAssessments: parsed.studentAssessments || defaultState.studentAssessments,
          gradeRevisions: parsed.gradeRevisions || defaultState.gradeRevisions,
          questionBanks: parsed.questionBanks || defaultState.questionBanks,
          questions: parsed.questions || defaultState.questions,
          examinations: parsed.examinations || defaultState.examinations,
          examSubmissions: parsed.examSubmissions || defaultState.examSubmissions,
          reportCards: parsed.reportCards || defaultState.reportCards,
          semesterResults: parsed.semesterResults || defaultState.semesterResults,
          universityTranscripts: parsed.universityTranscripts || defaultState.universityTranscripts,
          academicDecisions: parsed.academicDecisions || defaultState.academicDecisions,
          notifications: parsed.notifications || defaultState.notifications,
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
  public getTeachers(tenantId?: string): TeacherProfile[] {
    if (tenantId) {
      return this.state.teacherProfiles.filter((t) => t.tenantId === tenantId);
    }
    return [...this.state.teacherProfiles];
  }

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
  public getStudents(tenantId?: string): StudentProfile[] {
    if (tenantId) {
      return this.state.studentProfiles.filter((s) => !s.tenantId || s.tenantId === tenantId);
    }
    return [...this.state.studentProfiles];
  }

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

  public getStaff(tenantId?: string): StaffProfile[] {
    return this.getStaffProfiles();
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

  public getCurrentTenant(): Tenant | undefined {
    return this.state.tenants[0];
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

  public getClasses(tenantId?: string, academicYearId?: string): AcademicClass[] {
    return this.getAcademicClasses(tenantId, academicYearId);
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

  // ===========================================================================
  // PHASE 5: SISTEM PRESENSI & KEHADIRAN (SISWA & MAHASISWA)
  // ===========================================================================

  public getAttendanceSessions(
    tenantIdOrParams?: string | {
      tenantId?: string;
      classId?: string;
      date?: string;
      sessionType?: string;
      subjectId?: string;
      academicYearId?: string;
      semesterId?: string;
    },
    filterParams?: {
      classId?: string;
      date?: string;
      sessionType?: string;
      subjectId?: string;
      academicYearId?: string;
      semesterId?: string;
    }
  ): AttendanceSession[] {
    let list = [...this.state.attendanceSessions];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((s) => s.tenantId === tenantIdOrParams);
      if (filterParams?.classId) list = list.filter((s) => s.classId === filterParams.classId);
      if (filterParams?.date) list = list.filter((s) => s.date === filterParams.date);
      if (filterParams?.sessionType) list = list.filter((s) => s.sessionType === filterParams.sessionType);
      if (filterParams?.subjectId) list = list.filter((s) => s.subjectId === filterParams.subjectId);
      if (filterParams?.academicYearId) list = list.filter((s) => s.academicYearId === filterParams.academicYearId);
      if (filterParams?.semesterId) list = list.filter((s) => s.semesterId === filterParams.semesterId);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((s) => s.tenantId === params.tenantId);
    if (params?.classId) list = list.filter((s) => s.classId === params.classId);
    if (params?.date) list = list.filter((s) => s.date === params.date);
    if (params?.sessionType) list = list.filter((s) => s.sessionType === params.sessionType);
    if (params?.subjectId) list = list.filter((s) => s.subjectId === params.subjectId);
    if (params?.academicYearId) list = list.filter((s) => s.academicYearId === params.academicYearId);
    if (params?.semesterId) list = list.filter((s) => s.semesterId === params.semesterId);
    return list;
  }

  public getAttendanceSessionById(id: string): AttendanceSession | undefined {
    return this.state.attendanceSessions.find((s) => s.id === id);
  }

  public createAttendanceSession(
    data: Omit<AttendanceSession, 'id' | 'createdAt' | 'updatedAt'>,
    records?: {
      studentId: string;
      status: AttendanceType;
      notes?: string;
      lateMinutes?: number;
      excusedReason?: string;
      attachmentUrl?: string;
    }[],
    user?: User | null
  ): AttendanceSession {
    // 1. Anti-duplicate session validation
    const existing = this.state.attendanceSessions.find(
      (s) =>
        s.tenantId === data.tenantId &&
        s.classId === data.classId &&
        s.date === data.date &&
        s.sessionType === data.sessionType &&
        (s.subjectId || null) === (data.subjectId || null) &&
        (s.periodNumber || null) === (data.periodNumber || null)
    );
    if (existing) {
      throw new Error('Sesi presensi untuk kelas, tanggal, dan mata pelajaran ini sudah dibuat sebelumnya.');
    }

    // 2. Teacher assignment constraint check
    if (user && user.role === 'GURU' && data.subjectId) {
      const teacherProfile = this.getTeacherProfileByUserId(user.id);
      if (teacherProfile) {
        const assignments = this.getTeachingAssignments(data.tenantId).filter(
          (a) => a.teacherId === teacherProfile.id && a.classId === data.classId && a.subjectId === data.subjectId
        );
        if (assignments.length === 0) {
          throw new Error('Guru hanya diizinkan mencatat presensi untuk mata pelajaran dan rombel yang ditugaskan.');
        }
      }
    }

    const now = new Date().toISOString();
    const sessionId = generateId('sess');
    const newSession: AttendanceSession = {
      ...data,
      id: sessionId,
      createdAt: now,
      updatedAt: now,
    };

    this.state.attendanceSessions.unshift(newSession);

    // 3. Populate student records
    if (records && records.length > 0) {
      records.forEach((rec) => {
        const student = this.getStudentProfileById(rec.studentId);
        const recordId = generateId('sa');
        this.state.studentAttendances.push({
          id: recordId,
          tenantId: data.tenantId,
          sessionId,
          studentId: rec.studentId,
          studentName: student?.fullName || student?.name,
          nisOrNim: student?.nisn || student?.nis,
          status: rec.status,
          checkInTime: rec.status === 'HADIR' || rec.status === 'TERLAMBAT' ? now : undefined,
          lateMinutes: rec.lateMinutes || (rec.status === 'TERLAMBAT' ? 15 : 0),
          notes: rec.notes,
          excusedReason: rec.excusedReason,
          attachmentUrl: rec.attachmentUrl,
          createdAt: now,
          updatedAt: now,
        });
      });
    }

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ATTENDANCE_SESSION_CREATE',
      entity: 'ATTENDANCE',
      entityId: sessionId,
      details: `Membuat sesi presensi ${data.sessionType} kelas ${data.className || data.classId} tanggal ${data.date}`,
    });

    this.saveState();
    return newSession;
  }

  public updateAttendanceSession(
    id: string,
    data: Partial<AttendanceSession>,
    user?: User | null
  ): AttendanceSession | null {
    const idx = this.state.attendanceSessions.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    this.state.attendanceSessions[idx] = {
      ...this.state.attendanceSessions[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ATTENDANCE_SESSION_UPDATE',
      entity: 'ATTENDANCE',
      entityId: id,
      details: `Memperbarui sesi presensi ID ${id}`,
    });

    this.saveState();
    return this.state.attendanceSessions[idx];
  }

  public deleteAttendanceSession(id: string, user?: User | null): boolean {
    const idx = this.state.attendanceSessions.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    // Hapus relasi presensi siswa
    this.state.studentAttendances = this.state.studentAttendances.filter((r) => r.sessionId !== id);
    this.state.attendanceSessions.splice(idx, 1);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ATTENDANCE_SESSION_DELETE',
      entity: 'ATTENDANCE',
      entityId: id,
      details: `Menghapus sesi presensi ID ${id} beserta seluruh lembar rekap siswa`,
    });

    this.saveState();
    return true;
  }

  public getStudentAttendances(
    tenantIdOrParams?: string | {
      tenantId?: string;
      sessionId?: string;
      studentId?: string;
    },
    filterParams?: {
      sessionId?: string;
      studentId?: string;
    }
  ): StudentAttendance[] {
    let list = [...this.state.studentAttendances];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((r) => r.tenantId === tenantIdOrParams);
      if (filterParams?.sessionId) list = list.filter((r) => r.sessionId === filterParams.sessionId);
      if (filterParams?.studentId) list = list.filter((r) => r.studentId === filterParams.studentId);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((r) => r.tenantId === params.tenantId);
    if (params?.sessionId) list = list.filter((r) => r.sessionId === params.sessionId);
    if (params?.studentId) list = list.filter((r) => r.studentId === params.studentId);
    return list;
  }

  public recordStudentAttendanceBatch(
    tenantId: string,
    sessionId: string,
    records: any[],
    user?: User | null
  ): StudentAttendance[] {
    return this.recordStudentAttendance(sessionId, records, user);
  }

  public recordStudentAttendance(
    sessionId: string,
    records: {
      studentId: string;
      status: AttendanceType;
      notes?: string;
      lateMinutes?: number;
      excusedReason?: string;
      attachmentUrl?: string;
    }[],
    user?: User | null
  ): StudentAttendance[] {
    const session = this.getAttendanceSessionById(sessionId);
    if (!session) throw new Error('Sesi presensi tidak ditemukan');

    const now = new Date().toISOString();
    const updatedRecords: StudentAttendance[] = [];

    records.forEach((rec) => {
      const existingIdx = this.state.studentAttendances.findIndex(
        (r) => r.sessionId === sessionId && r.studentId === rec.studentId
      );

      const student = this.getStudentProfileById(rec.studentId);

      if (existingIdx !== -1) {
        this.state.studentAttendances[existingIdx] = {
          ...this.state.studentAttendances[existingIdx],
          status: rec.status,
          notes: rec.notes ?? this.state.studentAttendances[existingIdx].notes,
          lateMinutes: rec.lateMinutes ?? this.state.studentAttendances[existingIdx].lateMinutes,
          excusedReason: rec.excusedReason ?? this.state.studentAttendances[existingIdx].excusedReason,
          attachmentUrl: rec.attachmentUrl ?? this.state.studentAttendances[existingIdx].attachmentUrl,
          updatedAt: now,
        };
        updatedRecords.push(this.state.studentAttendances[existingIdx]);
      } else {
        const newRecord: StudentAttendance = {
          id: generateId('sa'),
          tenantId: session.tenantId,
          sessionId,
          studentId: rec.studentId,
          studentName: student?.fullName || student?.name,
          nisOrNim: student?.nisn || student?.nis,
          status: rec.status,
          checkInTime: rec.status === 'HADIR' || rec.status === 'TERLAMBAT' ? now : undefined,
          lateMinutes: rec.lateMinutes || (rec.status === 'TERLAMBAT' ? 15 : 0),
          notes: rec.notes,
          excusedReason: rec.excusedReason,
          attachmentUrl: rec.attachmentUrl,
          createdAt: now,
          updatedAt: now,
        };
        this.state.studentAttendances.push(newRecord);
        updatedRecords.push(newRecord);
      }
    });

    this.saveState();
    return updatedRecords;
  }

  public updateStudentAttendanceRecord(
    id: string,
    data: Partial<StudentAttendance>,
    user?: User | null
  ): StudentAttendance | null {
    const idx = this.state.studentAttendances.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    this.state.studentAttendances[idx] = {
      ...this.state.studentAttendances[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.studentAttendances[idx];
  }

  public getStudentAttendanceRecap(params: {
    tenantId: string;
    classId?: string;
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // 1. Temukan sesi yang sesuai
    let sessions = this.getAttendanceSessions({
      tenantId: params.tenantId,
      classId: params.classId,
      academicYearId: params.academicYearId,
      semesterId: params.semesterId,
    });

    if (params.startDate) sessions = sessions.filter((s) => s.date >= params.startDate!);
    if (params.endDate) sessions = sessions.filter((s) => s.date <= params.endDate!);

    const sessionIds = new Set(sessions.map((s) => s.id));
    let records = this.state.studentAttendances.filter((r) => sessionIds.has(r.sessionId));

    if (params.studentId) {
      records = records.filter((r) => r.studentId === params.studentId);
    }

    const counts = {
      hadir: records.filter((r) => r.status === 'HADIR').length,
      sakit: records.filter((r) => r.status === 'SAKIT').length,
      izin: records.filter((r) => r.status === 'IZIN').length,
      alpa: records.filter((r) => r.status === 'ALPA').length,
      terlambat: records.filter((r) => r.status === 'TERLAMBAT').length,
      dispensasi: records.filter((r) => r.status === 'DISPENSASI').length,
      dinas: records.filter((r) => r.status === 'DINAS').length,
      libur: records.filter((r) => r.status === 'LIBUR').length,
      totalSessions: records.length,
      attendancePercentage: records.length > 0
        ? Math.round(
            ((records.filter((r) => r.status === 'HADIR' || r.status === 'TERLAMBAT' || r.status === 'DISPENSASI').length) /
              records.length) *
              100
          )
        : 100,
    };

    return counts;
  }

  // ===========================================================================
  // PHASE 5: PRESENSI PEGAWAI & GURU
  // ===========================================================================

  public getStaffAttendances(
    tenantIdOrParams?: string | {
      tenantId?: string;
      staffId?: string;
      date?: string;
      month?: string; // YYYY-MM
    },
    filterParams?: {
      staffId?: string;
      date?: string;
      month?: string;
    }
  ): StaffAttendance[] {
    let list = [...this.state.staffAttendances];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((r) => r.tenantId === tenantIdOrParams);
      if (filterParams?.staffId) list = list.filter((r) => r.staffId === filterParams.staffId);
      if (filterParams?.date) list = list.filter((r) => r.date === filterParams.date);
      if (filterParams?.month) list = list.filter((r) => r.date.startsWith(filterParams.month!));
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((r) => r.tenantId === params.tenantId);
    if (params?.staffId) list = list.filter((r) => r.staffId === params.staffId);
    if (params?.date) list = list.filter((r) => r.date === params.date);
    if (params?.month) list = list.filter((r) => r.date.startsWith(params.month!));
    return list;
  }

  public recordStaffAttendance(
    data: Omit<StaffAttendance, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): StaffAttendance {
    return this.recordStaffAttendanceManual(data, user);
  }

  public clockInStaff(
    data: {
      tenantId: string;
      staffId: string;
      staffType: 'TEACHER' | 'ADMIN_STAFF' | 'STAFF';
      status?: AttendanceType;
      location?: string;
      notes?: string;
    },
    user?: User | null
  ): StaffAttendance {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const existingIdx = this.state.staffAttendances.findIndex(
      (r) => r.tenantId === data.tenantId && r.staffId === data.staffId && r.date === today
    );

    if (existingIdx !== -1) {
      return this.state.staffAttendances[existingIdx];
    }

    const teacher = this.getTeacherProfileById(data.staffId);
    const staff = this.getStaffProfiles().find((s) => s.id === data.staffId);
    const staffName = teacher?.fullName || staff?.fullName || user?.name;

    const newRecord: StaffAttendance = {
      id: generateId('stfa'),
      tenantId: data.tenantId,
      staffId: data.staffId,
      staffName,
      staffType: data.staffType,
      date: today,
      checkInTime: now,
      status: data.status || 'HADIR',
      location: data.location || 'Presensi Online Nusantara CMS',
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    this.state.staffAttendances.unshift(newRecord);
    this.saveState();
    return newRecord;
  }

  public clockOutStaff(id: string, checkOutTime?: string, user?: User | null): StaffAttendance | null {
    const idx = this.state.staffAttendances.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const now = checkOutTime || new Date().toISOString();
    this.state.staffAttendances[idx] = {
      ...this.state.staffAttendances[idx],
      checkOutTime: now,
      updatedAt: now,
    };

    this.saveState();
    return this.state.staffAttendances[idx];
  }

  public recordStaffAttendanceManual(
    data: Omit<StaffAttendance, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): StaffAttendance {
    const now = new Date().toISOString();
    const newRecord: StaffAttendance = {
      ...data,
      id: generateId('stfa'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.staffAttendances.unshift(newRecord);
    this.saveState();
    return newRecord;
  }

  // ===========================================================================
  // PHASE 5: PENGAJUAN IZIN / SAKIT / DISPENSASI (LEAVE REQUESTS)
  // ===========================================================================

  public getLeaveRequests(
    tenantIdOrParams?: string | {
      tenantId?: string;
      studentId?: string;
      requesterId?: string;
      status?: LeaveRequestStatus;
    },
    filterParams?: {
      studentId?: string;
      requesterId?: string;
      status?: LeaveRequestStatus;
    }
  ): LeaveRequest[] {
    let list = [...this.state.leaveRequests];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((r) => r.tenantId === tenantIdOrParams);
      if (filterParams?.studentId) list = list.filter((r) => r.studentId === filterParams.studentId);
      if (filterParams?.requesterId) list = list.filter((r) => r.requesterId === filterParams.requesterId);
      if (filterParams?.status) list = list.filter((r) => r.status === filterParams.status);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((r) => r.tenantId === params.tenantId);
    if (params?.studentId) list = list.filter((r) => r.studentId === params.studentId);
    if (params?.requesterId) list = list.filter((r) => r.requesterId === params.requesterId);
    if (params?.status) list = list.filter((r) => r.status === params.status);
    return list;
  }

  public getLeaveRequestById(id: string): LeaveRequest | undefined {
    return this.state.leaveRequests.find((r) => r.id === id);
  }

  public createLeaveRequest(
    data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): LeaveRequest {
    const now = new Date().toISOString();
    const newReq: LeaveRequest = {
      ...data,
      id: generateId('lr'),
      status: 'MENUNGGU',
      createdAt: now,
      updatedAt: now,
    };

    this.state.leaveRequests.unshift(newReq);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'LEAVE_REQUEST_SUBMIT',
      entity: 'LEAVE_REQUEST',
      entityId: newReq.id,
      details: `Pengajuan izin ${data.type} tanggal ${data.startDate} s/d ${data.endDate} untuk ${data.studentName || data.requesterName}`,
    });

    this.saveState();
    return newReq;
  }

  public reviewLeaveRequest(
    id: string,
    status: 'DISETUJUI' | 'DITOLAK',
    reviewNotes?: string,
    user?: User | null
  ): LeaveRequest | null {
    const idx = this.state.leaveRequests.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    this.state.leaveRequests[idx] = {
      ...this.state.leaveRequests[idx],
      status,
      reviewedBy: user?.id,
      reviewedByName: user?.name,
      reviewedAt: now,
      reviewNotes,
      updatedAt: now,
    };

    // Notifikasi internal otomatis kepada pemohon
    this.createNotification({
      tenantId: this.state.leaveRequests[idx].tenantId,
      userId: this.state.leaveRequests[idx].requesterId,
      title: `Pengajuan ${this.state.leaveRequests[idx].type} ${status}`,
      message: `Permohonan izin Anda telah diverifikasi oleh ${user?.name || 'Sekolah'} dengan status: ${status}.`,
      type: status === 'DISETUJUI' ? 'SUCCESS' : 'ALERT',
    });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: status === 'DISETUJUI' ? 'LEAVE_REQUEST_APPROVE' : 'LEAVE_REQUEST_REJECT',
      entity: 'LEAVE_REQUEST',
      entityId: id,
      details: `Memproses surat izin ID ${id} menjadi ${status}`,
    });

    this.saveState();
    return this.state.leaveRequests[idx];
  }

  public cancelLeaveRequest(id: string, user?: User | null): boolean {
    const idx = this.state.leaveRequests.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    this.state.leaveRequests[idx].status = 'DIBATALKAN';
    this.state.leaveRequests[idx].updatedAt = new Date().toISOString();
    this.saveState();
    return true;
  }

  public updateLeaveRequestStatus(
    id: string,
    status: LeaveRequestStatus,
    reviewNotes?: string,
    user?: User | null
  ): LeaveRequest | null {
    return this.reviewLeaveRequest(id, status as any, reviewNotes, user);
  }

  // ===========================================================================
  // PHASE 5: SISTEM PENILAIAN, CP/TP & BOBOT EVALUASI
  // ===========================================================================

  public getAssessmentComponents(
    tenantIdOrParams?: string | {
      tenantId?: string;
      subjectId?: string;
      classId?: string;
      academicYearId?: string;
      semesterId?: string;
    },
    filterParams?: {
      subjectId?: string;
      classId?: string;
      academicYearId?: string;
      semesterId?: string;
    }
  ): AssessmentComponent[] {
    let list = [...this.state.assessmentComponents];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((c) => c.tenantId === tenantIdOrParams);
      if (filterParams?.subjectId) list = list.filter((c) => c.subjectId === filterParams.subjectId);
      if (filterParams?.classId) list = list.filter((c) => !c.classId || c.classId === filterParams.classId);
      if (filterParams?.academicYearId) list = list.filter((c) => c.academicYearId === filterParams.academicYearId);
      if (filterParams?.semesterId) list = list.filter((c) => c.semesterId === filterParams.semesterId);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((c) => c.tenantId === params.tenantId);
    if (params?.subjectId) list = list.filter((c) => c.subjectId === params.subjectId);
    if (params?.classId) list = list.filter((c) => !c.classId || c.classId === params.classId);
    if (params?.academicYearId) list = list.filter((c) => c.academicYearId === params.academicYearId);
    if (params?.semesterId) list = list.filter((c) => c.semesterId === params.semesterId);
    return list;
  }

  public getAssessmentComponentById(id: string): AssessmentComponent | undefined {
    return this.state.assessmentComponents.find((c) => c.id === id);
  }

  public createAssessmentComponent(
    data: Omit<AssessmentComponent, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): AssessmentComponent {
    const now = new Date().toISOString();
    const newComp: AssessmentComponent = {
      ...data,
      id: generateId('comp'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.assessmentComponents.push(newComp);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ASSESSMENT_COMPONENT_CREATE',
      entity: 'ASSESSMENT',
      entityId: newComp.id,
      details: `Menambah komponen penilaian ${data.name} (Bobot: ${data.weight}%) pada ${data.subjectName || data.subjectId}`,
    });

    this.saveState();
    return newComp;
  }

  public updateAssessmentComponent(
    id: string,
    data: Partial<AssessmentComponent>,
    user?: User | null
  ): AssessmentComponent | null {
    const idx = this.state.assessmentComponents.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.state.assessmentComponents[idx] = {
      ...this.state.assessmentComponents[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.assessmentComponents[idx];
  }

  public deleteAssessmentComponent(id: string, user?: User | null): boolean {
    const idx = this.state.assessmentComponents.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    // Hapus juga nilai-nilai yang terikat pada komponen ini
    this.state.studentAssessments = this.state.studentAssessments.filter((sa) => sa.componentId !== id);
    this.state.assessmentComponents.splice(idx, 1);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ASSESSMENT_COMPONENT_DELETE',
      entity: 'ASSESSMENT',
      entityId: id,
      details: `Menghapus komponen penilaian ID ${id}`,
    });

    this.saveState();
    return true;
  }

  public getStudentAssessments(
    tenantIdOrParams?: string | {
      tenantId?: string;
      componentId?: string;
      studentId?: string;
    },
    filterParams?: {
      componentId?: string;
      studentId?: string;
    }
  ): StudentAssessment[] {
    let list = [...this.state.studentAssessments];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((sa) => sa.tenantId === tenantIdOrParams);
      if (filterParams?.componentId) list = list.filter((sa) => sa.componentId === filterParams.componentId);
      if (filterParams?.studentId) list = list.filter((sa) => sa.studentId === filterParams.studentId);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((sa) => sa.tenantId === params.tenantId);
    if (params?.componentId) list = list.filter((sa) => sa.componentId === params.componentId);
    if (params?.studentId) list = list.filter((sa) => sa.studentId === params.studentId);
    return list;
  }

  public upsertStudentAssessment(
    data: {
      tenantId: string;
      componentId: string;
      studentId: string;
      score: number;
      feedback?: string;
    },
    user?: User | null,
    revisionReason?: string
  ): StudentAssessment {
    if (data.score < 0 || data.score > 100) {
      throw new Error('Nilai harus berada dalam rentang angka 0 hingga 100.');
    }

    const comp = this.getAssessmentComponentById(data.componentId);
    if (!comp) throw new Error('Komponen penilaian tidak ditemukan.');

    // Validasi penugasan guru: guru hanya dapat menginput nilai untuk mapel yang diampunya
    if (user && user.role === 'GURU') {
      const teacherProfile = this.getTeacherProfileByUserId(user.id);
      if (teacherProfile) {
        const assignments = this.getTeachingAssignments(data.tenantId).filter(
          (a) => a.teacherId === teacherProfile.id && a.subjectId === comp.subjectId
        );
        if (assignments.length === 0) {
          throw new Error('Pendidik tidak memiliki kewenangan menginput nilai mata pelajaran ini.');
        }
      }
    }

    const existingIdx = this.state.studentAssessments.findIndex(
      (sa) => sa.componentId === data.componentId && sa.studentId === data.studentId
    );

    const now = new Date().toISOString();
    const student = this.getStudentProfileById(data.studentId);
    const studentName = student?.fullName || student?.name;

    if (existingIdx !== -1) {
      const existing = this.state.studentAssessments[existingIdx];

      // Kunci nilai (Lock mechanism)
      if (existing.isLocked) {
        throw new Error('Nilai telah dikunci dan tidak dapat diubah tanpa izin revisi.');
      }

      // Catat revisi nilai jika ada perubahan skor
      if (existing.score !== data.score) {
        const revision: GradeRevision = {
          id: generateId('gr'),
          tenantId: data.tenantId,
          studentAssessmentId: existing.id,
          studentId: data.studentId,
          componentId: data.componentId,
          oldScore: existing.score,
          newScore: data.score,
          reason: revisionReason || 'Koreksi nilai hasil evaluasi belajar oleh pengajar',
          changedBy: user?.id || 'system',
          changedByName: user?.name || 'Administrator',
          createdAt: now,
        };
        this.state.gradeRevisions.unshift(revision);
      }

      this.state.studentAssessments[existingIdx] = {
        ...existing,
        score: Number(data.score.toFixed(2)),
        feedback: data.feedback !== undefined ? data.feedback : existing.feedback,
        gradedBy: user?.id || existing.gradedBy,
        gradedAt: now,
        updatedAt: now,
      };

      this.saveState();
      return this.state.studentAssessments[existingIdx];
    } else {
      const newAssessment: StudentAssessment = {
        id: generateId('sa-comp'),
        tenantId: data.tenantId,
        componentId: data.componentId,
        studentId: data.studentId,
        studentName,
        score: Number(data.score.toFixed(2)),
        feedback: data.feedback,
        isLocked: false,
        gradedBy: user?.id,
        gradedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      this.state.studentAssessments.push(newAssessment);
      this.saveState();
      return newAssessment;
    }
  }

  public bulkSaveStudentAssessments(
    componentId: string,
    scores: { studentId: string; score: number; feedback?: string }[],
    user?: User | null
  ): StudentAssessment[] {
    const comp = this.getAssessmentComponentById(componentId);
    if (!comp) throw new Error('Komponen penilaian tidak ditemukan.');

    const results: StudentAssessment[] = [];
    scores.forEach((s) => {
      const res = this.upsertStudentAssessment(
        {
          tenantId: comp.tenantId,
          componentId,
          studentId: s.studentId,
          score: s.score,
          feedback: s.feedback,
        },
        user
      );
      results.push(res);
    });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'GRADE_BULK_INPUT',
      entity: 'ASSESSMENT',
      entityId: componentId,
      details: `Input massal nilai ${comp.name} untuk ${scores.length} peserta didik`,
    });

    this.saveState();
    return results;
  }

  public lockAssessmentGrades(componentId: string, locked: boolean, user?: User | null): boolean {
    const now = new Date().toISOString();
    let updatedCount = 0;

    this.state.studentAssessments.forEach((sa) => {
      if (sa.componentId === componentId) {
        sa.isLocked = locked;
        sa.lockedBy = locked ? user?.id : undefined;
        sa.lockedAt = locked ? now : undefined;
        sa.updatedAt = now;
        updatedCount++;
      }
    });

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: locked ? 'GRADE_LOCK' : 'GRADE_UNLOCK',
      entity: 'ASSESSMENT',
      entityId: componentId,
      details: `${locked ? 'Mengunci' : 'Membuka kunci'} nilai komponen ${componentId} (${updatedCount} catatan)`,
    });

    this.saveState();
    return true;
  }

  public toggleLockAssessment(componentId: string, locked: boolean, user?: User | null): boolean {
    return this.lockAssessmentGrades(componentId, locked, user);
  }

  public getGradeRevisions(params?: {
    tenantId?: string;
    componentId?: string;
    studentId?: string;
  }): GradeRevision[] {
    let list = [...this.state.gradeRevisions];
    if (params?.tenantId) list = list.filter((gr) => gr.tenantId === params.tenantId);
    if (params?.componentId) list = list.filter((gr) => gr.componentId === params.componentId);
    if (params?.studentId) list = list.filter((gr) => gr.studentId === params.studentId);
    return list;
  }

  public calculateStudentFinalSubjectGrade(
    tenantId: string,
    subjectId: string,
    studentId: string,
    classId?: string,
    academicYearId?: string,
    semesterId?: string
  ) {
    const components = this.getAssessmentComponents({
      tenantId,
      subjectId,
      classId,
      academicYearId,
      semesterId,
    });

    if (components.length === 0) {
      return { finalScore: 0, letterGrade: 'E', predicate: 'Belum Ada Penilaian', totalWeight: 0, isPassed: false };
    }

    let weightedScoreSum = 0;
    let totalWeight = 0;

    components.forEach((c) => {
      const assessment = this.state.studentAssessments.find(
        (sa) => sa.componentId === c.id && sa.studentId === studentId
      );
      if (assessment !== undefined) {
        weightedScoreSum += assessment.score * c.weight;
        totalWeight += c.weight;
      }
    });

    const finalScore = totalWeight > 0 ? Number((weightedScoreSum / totalWeight).toFixed(2)) : 0;
    const subj = this.state.subjects.find((s) => s.id === subjectId);
    const kkm = subj?.minPassingGrade || 75;

    let letterGrade = 'E';
    let predicate = 'Perlu Pendampingan';

    if (finalScore >= 85) {
      letterGrade = 'A';
      predicate = 'Sangat Baik';
    } else if (finalScore >= 75) {
      letterGrade = 'B';
      predicate = 'Baik';
    } else if (finalScore >= 60) {
      letterGrade = 'C';
      predicate = 'Cukup';
    } else if (finalScore >= 50) {
      letterGrade = 'D';
      predicate = 'Kurang';
    } else {
      letterGrade = 'E';
      predicate = 'Sangat Kurang';
    }

    return {
      finalScore,
      letterGrade,
      predicate,
      totalWeight,
      isPassed: finalScore >= kkm,
      kkm,
    };
  }

  // ===========================================================================
  // PHASE 5: BANK SOAL EVALUASI & UJIAN ONLINE
  // ===========================================================================

  public getQuestionBanks(
    tenantIdOrParams?: string | { tenantId?: string; subjectId?: string },
    subjectIdParam?: string
  ): QuestionBank[] {
    let list = [...this.state.questionBanks];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((b) => b.tenantId === tenantIdOrParams);
      if (subjectIdParam) list = list.filter((b) => b.subjectId === subjectIdParam);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((b) => b.tenantId === params.tenantId);
    if (params?.subjectId) list = list.filter((b) => b.subjectId === params.subjectId);
    return list;
  }

  public getQuestionBankById(id: string): QuestionBank | undefined {
    return this.state.questionBanks.find((b) => b.id === id);
  }

  public createQuestionBank(
    data: Omit<QuestionBank, 'id' | 'totalQuestions' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): QuestionBank {
    const now = new Date().toISOString();
    const newBank: QuestionBank = {
      ...data,
      id: generateId('qb'),
      totalQuestions: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.state.questionBanks.unshift(newBank);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'QUESTION_BANK_CREATE',
      entity: 'QUESTION_BANK',
      entityId: newBank.id,
      details: `Membuat Bank Soal ${data.name} untuk mapel ${data.subjectName || data.subjectId}`,
    });

    this.saveState();
    return newBank;
  }

  public updateQuestionBank(
    id: string,
    data: Partial<QuestionBank>,
    user?: User | null
  ): QuestionBank | null {
    const idx = this.state.questionBanks.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    this.state.questionBanks[idx] = {
      ...this.state.questionBanks[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.questionBanks[idx];
  }

  public deleteQuestionBank(id: string, user?: User | null): boolean {
    const idx = this.state.questionBanks.findIndex((b) => b.id === id);
    if (idx === -1) return false;

    // Hapus butir soal di bank ini
    this.state.questions = this.state.questions.filter((q) => q.bankId !== id);
    this.state.questionBanks.splice(idx, 1);

    this.saveState();
    return true;
  }

  public getQuestions(
    tenantIdOrParams?: string | {
      tenantId?: string;
      bankId?: string;
      subjectId?: string;
      gradeLevel?: string;
    },
    bankIdParam?: string
  ): Question[] {
    let list = [...this.state.questions];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((q) => q.tenantId === tenantIdOrParams);
      if (bankIdParam) list = list.filter((q) => q.bankId === bankIdParam);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((q) => q.tenantId === params.tenantId);
    if (params?.bankId) list = list.filter((q) => q.bankId === params.bankId);
    if (params?.subjectId) list = list.filter((q) => q.subjectId === params.subjectId);
    if (params?.gradeLevel) list = list.filter((q) => q.gradeLevel === params.gradeLevel);
    return list;
  }

  public getQuestionById(id: string): Question | undefined {
    return this.state.questions.find((q) => q.id === id);
  }

  public createQuestion(
    data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): Question {
    const now = new Date().toISOString();
    const newQ: Question = {
      ...data,
      id: generateId('q'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.questions.push(newQ);

    // Update total questions in bank
    if (data.bankId) {
      const bank = this.getQuestionBankById(data.bankId);
      if (bank) {
        bank.totalQuestions = (bank.totalQuestions || 0) + 1;
        bank.updatedAt = now;
      }
    }

    this.saveState();
    return newQ;
  }

  public updateQuestion(id: string, data: Partial<Question>, user?: User | null): Question | null {
    const idx = this.state.questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;

    this.state.questions[idx] = {
      ...this.state.questions[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.questions[idx];
  }

  public deleteQuestion(id: string, user?: User | null): boolean {
    const idx = this.state.questions.findIndex((q) => q.id === id);
    if (idx === -1) return false;

    const q = this.state.questions[idx];
    if (q.bankId) {
      const bank = this.getQuestionBankById(q.bankId);
      if (bank && bank.totalQuestions > 0) {
        bank.totalQuestions -= 1;
      }
    }

    this.state.questions.splice(idx, 1);
    this.saveState();
    return true;
  }

  // ===========================================================================
  // PHASE 5: EVALUASI & PELAKSANAAN UJIAN (ONLINE / OFFLINE)
  // ===========================================================================

  public getExaminations(
    tenantIdOrParams?: string | {
      tenantId?: string;
      classId?: string;
      subjectId?: string;
      status?: ExamStatus;
    },
    filterParams?: {
      classId?: string;
      subjectId?: string;
      status?: ExamStatus;
    }
  ): Examination[] {
    let list = [...this.state.examinations];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((e) => e.tenantId === tenantIdOrParams);
      if (filterParams?.classId) list = list.filter((e) => (e.classIds || []).includes(filterParams.classId!));
      if (filterParams?.subjectId) list = list.filter((e) => e.subjectId === filterParams.subjectId);
      if (filterParams?.status) list = list.filter((e) => e.status === filterParams.status);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((e) => e.tenantId === params.tenantId);
    if (params?.classId) list = list.filter((e) => (e.classIds || []).includes(params.classId!));
    if (params?.subjectId) list = list.filter((e) => e.subjectId === params.subjectId);
    if (params?.status) list = list.filter((e) => e.status === params.status);
    return list;
  }

  public getExaminationById(id: string): Examination | undefined {
    return this.state.examinations.find((e) => e.id === id);
  }

  public createExamination(
    data: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): Examination {
    const now = new Date().toISOString();
    const newExam: Examination = {
      ...data,
      id: generateId('exam'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.examinations.unshift(newExam);

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'EXAMINATION_CREATE',
      entity: 'EXAMINATION',
      entityId: newExam.id,
      details: `Menjadwalkan ujian ${data.title} (${data.mode}) durasi ${data.durationMinutes} menit`,
    });

    this.saveState();
    return newExam;
  }

  public updateExamination(
    id: string,
    data: Partial<Examination>,
    user?: User | null
  ): Examination | null {
    const idx = this.state.examinations.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    this.state.examinations[idx] = {
      ...this.state.examinations[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.examinations[idx];
  }

  public deleteExamination(id: string, user?: User | null): boolean {
    const idx = this.state.examinations.findIndex((e) => e.id === id);
    if (idx === -1) return false;

    this.state.examSubmissions = this.state.examSubmissions.filter((s) => s.examId !== id);
    this.state.examinations.splice(idx, 1);
    this.saveState();
    return true;
  }

  public getExamSubmissions(
    tenantIdOrParams?: string | {
      tenantId?: string;
      examId?: string;
      studentId?: string;
    },
    examIdParam?: string,
    studentIdParam?: string
  ): ExamSubmission[] {
    let list = [...this.state.examSubmissions];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((s) => s.tenantId === tenantIdOrParams);
      if (examIdParam) list = list.filter((s) => s.examId === examIdParam);
      if (studentIdParam) list = list.filter((s) => s.studentId === studentIdParam);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((s) => s.tenantId === params.tenantId);
    if (params?.examId) list = list.filter((s) => s.examId === params.examId);
    if (params?.studentId) list = list.filter((s) => s.studentId === params.studentId);
    return list;
  }

  public getExamSubmissionById(id: string): ExamSubmission | undefined {
    return this.state.examSubmissions.find((s) => s.id === id);
  }

  public startExamSubmission(examId: string, studentId: string, user?: User | null): ExamSubmission {
    const exam = this.getExaminationById(examId);
    if (!exam) throw new Error('Ujian tidak ditemukan');

    // Cek apakah sudah pernah memulai atau submit
    const existing = this.state.examSubmissions.find(
      (s) => s.examId === examId && s.studentId === studentId
    );
    if (existing) return existing;

    const student = this.getStudentProfileById(studentId);
    const now = new Date().toISOString();

    const newSub: ExamSubmission = {
      id: generateId('sub'),
      tenantId: exam.tenantId,
      examId,
      examTitle: exam.title,
      studentId,
      studentName: student?.fullName || student?.name,
      startedAt: now,
      answers: {},
      status: 'IN_PROGRESS',
    };

    this.state.examSubmissions.push(newSub);
    this.saveState();
    return newSub;
  }

  public submitExam(
    submissionIdOrPayload: string | {
      tenantId?: string;
      examId: string;
      studentId: string;
      answers: any[] | Record<string, any>;
      durationSeconds?: number;
    },
    answersOrUser?: Record<string, ExamAnswer> | User | null,
    durationSeconds?: number,
    userParam?: User | null
  ): ExamSubmission {
    let sub: ExamSubmission;
    let answers: Record<string, ExamAnswer> = {};
    let user: User | null | undefined;
    const duration = durationSeconds || 3600;

    if (typeof submissionIdOrPayload === 'string') {
      const idx = this.state.examSubmissions.findIndex((s) => s.id === submissionIdOrPayload);
      if (idx === -1) throw new Error('Lembar pengerjaan ujian tidak ditemukan');
      sub = this.state.examSubmissions[idx];
      answers = (answersOrUser as Record<string, ExamAnswer>) || {};
      user = userParam;
    } else {
      const payload = submissionIdOrPayload;
      user = answersOrUser as (User | null | undefined);
      let existing = this.state.examSubmissions.find(
        (s) => s.examId === payload.examId && s.studentId === payload.studentId
      );
      if (!existing) {
        existing = this.startExamSubmission(payload.examId, payload.studentId, user);
      }
      sub = existing;
      if (Array.isArray(payload.answers)) {
        payload.answers.forEach((a: any) => {
          answers[a.questionId] = {
            questionId: a.questionId,
            selectedOptionIds: a.answer ? [a.answer] : undefined,
            textAnswer: typeof a.answer === 'string' ? a.answer : undefined,
          };
        });
      } else {
        answers = payload.answers || {};
      }
    }

    const exam = this.getExaminationById(sub.examId);
    if (!exam) throw new Error('Data ujian tidak valid');

    const now = new Date().toISOString();
    let objectiveScore = 0;
    let essayScore = 0;
    const gradedAnswers: Record<string, ExamAnswer> = {};

    const qIds = exam.questionIds || [];
    qIds.forEach((qId) => {
      const q = this.getQuestionById(qId);
      const studentAns = answers[qId] || {};

      if (!q) {
        gradedAnswers[qId] = studentAns;
        return;
      }

      const weight = q.scoreWeight || q.points || 10;

      if (q.questionType === 'PILIHAN_GANDA' || q.questionType === 'BENAR_SALAH') {
        const selectedId = studentAns.selectedOptionIds?.[0];
        const correctOpt = q.options?.find((o: any) => o.isCorrect);
        const correctAns = q.correctAnswer || (correctOpt ? correctOpt.id : undefined);
        const isCorrect = selectedId && (selectedId === correctAns || (correctOpt && selectedId === correctOpt.id));
        const scoreEarned = isCorrect ? weight : 0;
        objectiveScore += scoreEarned;

        gradedAnswers[qId] = {
          ...studentAns,
          questionId: qId,
          isCorrect: !!isCorrect,
          scoreEarned,
        };
      } else if (q.questionType === 'PILIHAN_GANDA_KOMPLEKS') {
        const correctIds = q.correctAnswers || q.options?.filter((o: any) => o.isCorrect).map((o: any) => o.id) || [];
        const studentSelected = studentAns.selectedOptionIds || [];
        const isExactMatch =
          correctIds.length === studentSelected.length &&
          correctIds.every((id: any) => studentSelected.includes(id));
        const scoreEarned = isExactMatch ? weight : 0;
        objectiveScore += scoreEarned;

        gradedAnswers[qId] = {
          ...studentAns,
          questionId: qId,
          isCorrect: isExactMatch,
          scoreEarned,
        };
      } else if (q.questionType === 'MENJODOHKAN') {
        objectiveScore += weight;
        gradedAnswers[qId] = {
          ...studentAns,
          questionId: qId,
          isCorrect: true,
          scoreEarned: weight,
        };
      } else if (q.questionType === 'ESAI') {
        const score = studentAns.scoreEarned || 0;
        gradedAnswers[qId] = {
          ...studentAns,
          questionId: qId,
          isCorrect: undefined,
          scoreEarned: score,
        };
        essayScore += score;
      } else {
        gradedAnswers[qId] = studentAns;
      }
    });

    const totalScore = Number((objectiveScore + essayScore).toFixed(2));
    const isPassed = totalScore >= exam.passingGrade;

    const subIdx = this.state.examSubmissions.findIndex((s) => s.id === sub.id);
    this.state.examSubmissions[subIdx] = {
      ...sub,
      submittedAt: now,
      durationSeconds: duration,
      answers: gradedAnswers,
      objectiveScore,
      essayScore,
      totalScore,
      isPassed,
      status: 'GRADED',
      updatedAt: now,
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'EXAM_SUBMISSION_FINALIZE',
      entity: 'EXAMINATION',
      entityId: sub.id,
      details: `Menyelesaikan ujian ${exam.title}. Skor Akhir: ${totalScore} (Lulus: ${isPassed ? 'Ya' : 'Tidak'})`,
    });

    this.saveState();
    return this.state.examSubmissions[subIdx];
  }

  public gradeEssayAnswer(
    submissionId: string,
    questionId: string,
    scoreEarned: number,
    feedback?: string,
    user?: User | null
  ): ExamSubmission | null {
    const idx = this.state.examSubmissions.findIndex((s) => s.id === submissionId);
    if (idx === -1) return null;

    const sub = this.state.examSubmissions[idx];
    const exam = this.getExaminationById(sub.examId);

    const answers = { ...sub.answers };
    answers[questionId] = {
      ...answers[questionId],
      scoreEarned,
      gradedFeedback: feedback,
    };

    let totalEssay = 0;
    Object.values(answers).forEach((ans: any) => {
      const q = this.getQuestionById(ans.questionId);
      if (q?.questionType === 'ESAI') {
        totalEssay += ans.scoreEarned || 0;
      }
    });

    const objScore = sub.objectiveScore || 0;
    const totalScore = Number((objScore + totalEssay).toFixed(2));
    const isPassed = exam ? totalScore >= exam.passingGrade : false;

    this.state.examSubmissions[idx] = {
      ...sub,
      answers,
      essayScore: totalEssay,
      totalScore,
      isPassed,
      gradedBy: user?.id,
      gradedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.examSubmissions[idx];
  }

  public gradeExamSubmissionManual(
    tenantId: string,
    submissionId: string,
    newFinalScore: number,
    isPassed: boolean,
    feedback: string,
    user?: User | null
  ): ExamSubmission | null {
    const idx = this.state.examSubmissions.findIndex((s) => s.id === submissionId);
    if (idx === -1) return null;
    this.state.examSubmissions[idx] = {
      ...this.state.examSubmissions[idx],
      totalScore: newFinalScore,
      isPassed,
      feedback,
      status: 'GRADED',
      gradedBy: user?.id,
      gradedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.examSubmissions[idx];
  }

  // ===========================================================================
  // PHASE 5: RAPOR SEKOLAH (K-12: SD, SMP, SMA, SMK)
  // ===========================================================================

  public getReportCards(
    tenantIdOrParams?: string | {
      tenantId?: string;
      classId?: string;
      studentId?: string;
      academicYearId?: string;
      semesterId?: string;
      status?: ReportCardStatus;
    },
    filterParams?: {
      classId?: string;
      studentId?: string;
      academicYearId?: string;
      semesterId?: string;
      status?: ReportCardStatus;
    }
  ): ReportCard[] {
    let list = [...this.state.reportCards];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((r) => r.tenantId === tenantIdOrParams);
      if (filterParams?.classId) list = list.filter((r) => r.classId === filterParams.classId);
      if (filterParams?.studentId) list = list.filter((r) => r.studentId === filterParams.studentId);
      if (filterParams?.academicYearId) list = list.filter((r) => r.academicYearId === filterParams.academicYearId);
      if (filterParams?.semesterId) list = list.filter((r) => r.semesterId === filterParams.semesterId);
      if (filterParams?.status) list = list.filter((r) => r.status === filterParams.status);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((r) => r.tenantId === params.tenantId);
    if (params?.classId) list = list.filter((r) => r.classId === params.classId);
    if (params?.studentId) list = list.filter((r) => r.studentId === params.studentId);
    if (params?.academicYearId) list = list.filter((r) => r.academicYearId === params.academicYearId);
    if (params?.semesterId) list = list.filter((r) => r.semesterId === params.semesterId);
    if (params?.status) list = list.filter((r) => r.status === params.status);
    return list;
  }

  public upsertReportCard(data: any, user?: User | null): ReportCard {
    const existingIdx = this.state.reportCards.findIndex(
      (r) =>
        r.tenantId === data.tenantId &&
        r.studentId === data.studentId &&
        r.academicYearId === data.academicYearId
    );
    const now = new Date().toISOString();
    const item: ReportCard = {
      id: existingIdx !== -1 ? this.state.reportCards[existingIdx].id : generateId('rc'),
      createdAt: existingIdx !== -1 ? this.state.reportCards[existingIdx].createdAt : now,
      updatedAt: now,
      ...data,
      grades: data.grades || [],
    };
    if (existingIdx !== -1) {
      this.state.reportCards[existingIdx] = item;
    } else {
      this.state.reportCards.unshift(item);
    }
    this.saveState();
    return item;
  }

  public getReportCardById(id: string): ReportCard | undefined {
    return this.state.reportCards.find((r) => r.id === id);
  }

  public generateReportCard(
    data: {
      tenantId: string;
      studentId: string;
      classId: string;
      academicYearId: string;
      semesterId: string;
    },
    user?: User | null
  ): ReportCard {
    const student = this.getStudentProfileById(data.studentId);
    const cls = this.getAcademicClassById(data.classId);
    const ay = this.state.academicYears.find((y) => y.id === data.academicYearId);
    const term = this.state.academicTerms.find((t) => t.id === data.semesterId);
    const settings = this.getSettings();

    // Hitung seluruh mata pelajaran pada kelas ini
    const subjects = this.getSubjects(data.tenantId);
    const items: ReportCardItem[] = [];

    subjects.forEach((subj) => {
      const gradeResult = this.calculateStudentFinalSubjectGrade(
        data.tenantId,
        subj.id,
        data.studentId,
        data.classId,
        data.academicYearId,
        data.semesterId
      );

      items.push({
        subjectId: subj.id,
        subjectName: subj.name,
        subjectCode: subj.code,
        kkm: gradeResult.kkm,
        finalScore: gradeResult.finalScore,
        letterGrade: gradeResult.letterGrade,
        predicate: gradeResult.predicate,
        competencyAchievement:
          gradeResult.finalScore >= 85
            ? `Menunjukkan pemahaman sangat baik dan menguasai seluruh tujuan pembelajaran mata pelajaran ${subj.name}.`
            : `Mampu mencapai kompetensi dasar dengan baik dan tuntas pada mata pelajaran ${subj.name}.`,
      });
    });

    // Hitung rekap presensi
    const attRecap = this.getStudentAttendanceRecap({
      tenantId: data.tenantId,
      classId: data.classId,
      studentId: data.studentId,
      academicYearId: data.academicYearId,
      semesterId: data.semesterId,
    });

    const now = new Date().toISOString();
    const existingIdx = this.state.reportCards.findIndex(
      (r) =>
        r.tenantId === data.tenantId &&
        r.studentId === data.studentId &&
        r.academicYearId === data.academicYearId &&
        r.semesterId === data.semesterId
    );

    const homeroom = this.getTeacherProfiles().find((t) => t.id === cls?.homeroomTeacherId);

    const reportCard: ReportCard = {
      id: existingIdx !== -1 ? this.state.reportCards[existingIdx].id : generateId('rc'),
      tenantId: data.tenantId,
      studentId: data.studentId,
      studentName: student?.fullName || student?.name,
      nisn: student?.nisn,
      nis: student?.nis,
      academicYearId: data.academicYearId,
      academicYearName: ay?.name || '2026/2027',
      semesterId: data.semesterId,
      semesterName: term?.name || 'Ganjil',
      classId: data.classId,
      className: cls?.name || 'Rombel',
      homeroomTeacherId: cls?.homeroomTeacherId || 'tp-1',
      homeroomTeacherName: homeroom?.fullName || 'Wali Kelas',
      principalId: 'user-kepsek',
      principalName: settings.principalName || 'Dra. Hj. Ratna Juwita, M.Pd',
      status: 'DRAFT',
      items,
      extracurriculars: [
        { name: 'Pramuka & Karakter Kebangsaan', predicate: 'A (Sangat Baik)', notes: 'Tertib dan berjiwa sosial tinggi' },
      ],
      achievements: [],
      attendance: {
        hadir: attRecap.hadir,
        sakit: attRecap.sakit,
        izin: attRecap.izin,
        alpa: attRecap.alpa,
        terlambat: attRecap.terlambat,
      },
      homeroomNotes: 'Tingkatkan terus ketekunan belajar dan pertahankan akhlak mulia.',
      principalNotes: 'Selamat atas kemajuan belajar yang dicapai semester ini.',
      promotionStatus: 'ONGOING',
      issuedDate: now.split('T')[0],
      createdAt: existingIdx !== -1 ? this.state.reportCards[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx !== -1) {
      this.state.reportCards[existingIdx] = reportCard;
    } else {
      this.state.reportCards.unshift(reportCard);
    }

    this.saveState();
    return reportCard;
  }

  public updateReportCard(
    id: string,
    data: Partial<ReportCard>,
    user?: User | null
  ): ReportCard | null {
    const idx = this.state.reportCards.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    this.state.reportCards[idx] = {
      ...this.state.reportCards[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.reportCards[idx];
  }

  public approveReportCard(
    id: string,
    approverRole: 'WALI_KELAS' | 'KEPALA_SEKOLAH',
    user?: User | null
  ): ReportCard | null {
    const idx = this.state.reportCards.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const current = this.state.reportCards[idx];

    if (approverRole === 'WALI_KELAS') {
      current.status = 'CHECKED';
      current.approvedByHomeroomAt = now;
    } else if (approverRole === 'KEPALA_SEKOLAH') {
      current.status = 'APPROVED';
      current.approvedByPrincipalAt = now;

      // Notifikasi ke siswa & orang tua
      this.createNotification({
        tenantId: current.tenantId,
        userId: current.studentId,
        title: 'Buku Rapor Telah Disahkan',
        message: `Rapor semester ${current.semesterName} ${current.academicYearName} telah diverifikasi dan disahkan oleh Kepala Sekolah.`,
        type: 'SUCCESS',
      });
    }

    current.updatedAt = now;

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'REPORT_CARD_APPROVE',
      entity: 'REPORT_CARD',
      entityId: id,
      details: `Verifikasi & Pengesahan rapor siswa ${current.studentName} oleh ${approverRole}`,
    });

    this.saveState();
    return current;
  }

  public updateReportCardStatus(
    id: string,
    status: ReportCardStatus,
    user?: User | null
  ): ReportCard | null {
    return this.updateReportCard(id, { status }, user);
  }

  // ===========================================================================
  // PHASE 5: PERGURUAN TINGGI (KHS, SKS, IPS, IPK, & TRANSKRIP)
  // ===========================================================================

  public getSemesterResults(
    tenantIdOrParams?: string | {
      tenantId?: string;
      studentId?: string;
      academicYearId?: string;
      semesterId?: string;
    },
    studentIdParam?: string
  ): SemesterResult[] {
    let list = [...this.state.semesterResults];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((r) => r.tenantId === tenantIdOrParams);
      if (studentIdParam) list = list.filter((r) => r.studentId === studentIdParam);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((r) => r.tenantId === params.tenantId);
    if (params?.studentId) list = list.filter((r) => r.studentId === params.studentId);
    if (params?.academicYearId) list = list.filter((r) => r.academicYearId === params.academicYearId);
    if (params?.semesterId) list = list.filter((r) => r.semesterId === params.semesterId);
    return list;
  }

  public upsertSemesterResult(data: any, user?: User | null): SemesterResult {
    const existingIdx = this.state.semesterResults.findIndex(
      (r) =>
        r.tenantId === data.tenantId &&
        r.studentId === data.studentId &&
        r.semesterNumber === data.semesterNumber
    );
    const now = new Date().toISOString();
    const item: SemesterResult = {
      id: existingIdx !== -1 ? this.state.semesterResults[existingIdx].id : generateId('sr'),
      createdAt: existingIdx !== -1 ? this.state.semesterResults[existingIdx].createdAt : now,
      updatedAt: now,
      ...data,
    };
    if (existingIdx !== -1) {
      this.state.semesterResults[existingIdx] = item;
    } else {
      this.state.semesterResults.unshift(item);
    }
    this.saveState();
    return item;
  }

  public getSemesterResultById(id: string): SemesterResult | undefined {
    return this.state.semesterResults.find((r) => r.id === id);
  }

  public calculateAndPublishSemesterResult(
    tenantId: string,
    studentId: string,
    academicYearId: string,
    semesterId: string,
    user?: User | null
  ): SemesterResult {
    const student = this.getStudentProfileById(studentId);
    const ay = this.state.academicYears.find((y) => y.id === academicYearId);
    const term = this.state.academicTerms.find((t) => t.id === semesterId);

    // Ambil mata kuliah kampus
    let courses = this.getSubjects(tenantId);
    if (courses.length === 0) courses = this.getSubjects();
    const items: KHSItem[] = [];
    let totalSks = 0;
    let totalQualityPoints = 0;

    courses.forEach((c) => {
      const sks = c.credits || c.creditHours || 3;
      const gradeResult = this.calculateStudentFinalSubjectGrade(
        tenantId,
        c.id,
        studentId,
        undefined,
        academicYearId,
        semesterId
      );

      const numeric = gradeResult.finalScore > 0 ? gradeResult.finalScore : 85;

      let letter: GradeLetter = 'A';
      let qp = 4.0;
      if (numeric >= 85) {
        letter = 'A';
        qp = 4.0;
      } else if (numeric >= 80) {
        letter = 'A-';
        qp = 3.7;
      } else if (numeric >= 75) {
        letter = 'B+';
        qp = 3.3;
      } else if (numeric >= 70) {
        letter = 'B';
        qp = 3.0;
      } else if (numeric >= 65) {
        letter = 'B-';
        qp = 2.7;
      } else if (numeric >= 60) {
        letter = 'C+';
        qp = 2.3;
      } else if (numeric >= 55) {
        letter = 'C';
        qp = 2.0;
      } else if (numeric >= 45) {
        letter = 'D';
        qp = 1.0;
      } else {
        letter = 'E';
        qp = 0.0;
      }

      const weightedQp = Number((sks * qp).toFixed(2));
      totalSks += sks;
      totalQualityPoints += weightedQp;

      items.push({
        courseId: c.id,
        courseCode: c.code,
        courseName: c.name,
        sks,
        numericScore: numeric,
        letterGrade: letter,
        qualityPoint: qp,
        weightedQualityPoint: weightedQp,
        status: qp >= 2.0 ? 'LULUS' : 'MENGULANG',
      });
    });

    const ips = totalSks > 0 ? Number((totalQualityPoints / totalSks).toFixed(2)) : 0;
    const ipk = ips; // Sederhana untuk 1 semester

    const now = new Date().toISOString();
    const existingIdx = this.state.semesterResults.findIndex(
      (r) =>
        r.tenantId === tenantId &&
        r.studentId === studentId &&
        r.academicYearId === academicYearId &&
        r.semesterId === semesterId
    );

    const semResult: SemesterResult = {
      id: existingIdx !== -1 ? this.state.semesterResults[existingIdx].id : generateId('sr'),
      tenantId,
      studentId,
      studentName: student?.fullName || student?.name,
      nim: student?.nisn || student?.nis || 'NIM-DEFAULT',
      academicYearId,
      semesterId,
      semesterName: term?.name || 'Semester Ganjil',
      totalSks,
      totalQualityPoints: Number(totalQualityPoints.toFixed(2)),
      ips,
      ipk,
      cumulativeSks: totalSks,
      items,
      status: 'PUBLISHED',
      createdAt: existingIdx !== -1 ? this.state.semesterResults[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx !== -1) {
      this.state.semesterResults[existingIdx] = semResult;
    } else {
      this.state.semesterResults.unshift(semResult);
    }

    this.saveState();
    return semResult;
  }

  public getUniversityTranscripts(
    tenantIdOrParams?: string | {
      tenantId?: string;
      studentId?: string;
    },
    studentIdParam?: string
  ): UniversityTranscript[] {
    let list = [...this.state.universityTranscripts];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((t) => t.tenantId === tenantIdOrParams);
      if (studentIdParam) list = list.filter((t) => t.studentId === studentIdParam);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((t) => t.tenantId === params.tenantId);
    if (params?.studentId) list = list.filter((t) => t.studentId === params.studentId);
    return list;
  }

  public upsertUniversityTranscript(data: any, user?: User | null): UniversityTranscript {
    const existingIdx = this.state.universityTranscripts.findIndex(
      (t) => t.tenantId === data.tenantId && t.studentId === data.studentId
    );
    const now = new Date().toISOString();
    const item: UniversityTranscript = {
      id: existingIdx !== -1 ? this.state.universityTranscripts[existingIdx].id : generateId('tr'),
      createdAt: existingIdx !== -1 ? this.state.universityTranscripts[existingIdx].createdAt : now,
      updatedAt: now,
      ...data,
    };
    if (existingIdx !== -1) {
      this.state.universityTranscripts[existingIdx] = item;
    } else {
      this.state.universityTranscripts.unshift(item);
    }
    this.saveState();
    return item;
  }

  public generateUniversityTranscript(
    tenantId: string,
    studentId: string,
    user?: User | null
  ): UniversityTranscript {
    const student = this.getStudentProfileById(studentId);
    const existingIdx = this.state.universityTranscripts.findIndex(
      (t) => t.tenantId === tenantId && t.studentId === studentId
    );

    const now = new Date().toISOString();
    const transcript: UniversityTranscript = {
      id: existingIdx !== -1 ? this.state.universityTranscripts[existingIdx].id : generateId('tr'),
      tenantId,
      studentId,
      nim: student?.nisn || student?.nis || '260401001',
      studentName: student?.fullName || student?.name || 'Mahasiswa',
      programStudi: 'D4 Teknologi Rekayasa Perangkat Lunak',
      faculty: 'Teknologi Informasi & Komputer',
      totalSksEarned: 20,
      ipkCumulative: 3.84,
      predicate: 'DENGAN_PUJIAN',
      issuedDate: now.split('T')[0],
      isOfficial: true,
      createdAt: existingIdx !== -1 ? this.state.universityTranscripts[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx !== -1) {
      this.state.universityTranscripts[existingIdx] = transcript;
    } else {
      this.state.universityTranscripts.unshift(transcript);
    }

    this.saveState();
    return transcript;
  }

  // ===========================================================================
  // PHASE 5: KEPUTUSAN AKADEMIK (KENAIKAN KELAS & KELULUSAN)
  // ===========================================================================

  public getAcademicDecisions(
    tenantIdOrParams?: string | {
      tenantId?: string;
      classId?: string;
      academicYearId?: string;
      studentId?: string;
    },
    filterParams?: {
      classId?: string;
      academicYearId?: string;
      studentId?: string;
    }
  ): AcademicDecision[] {
    let list = [...this.state.academicDecisions];
    if (typeof tenantIdOrParams === 'string') {
      list = list.filter((d) => d.tenantId === tenantIdOrParams);
      if (filterParams?.classId) list = list.filter((d) => d.classId === filterParams.classId);
      if (filterParams?.academicYearId) list = list.filter((d) => d.academicYearId === filterParams.academicYearId);
      if (filterParams?.studentId) list = list.filter((d) => d.studentId === filterParams.studentId);
      return list;
    }
    const params = tenantIdOrParams;
    if (params?.tenantId) list = list.filter((d) => d.tenantId === params.tenantId);
    if (params?.classId) list = list.filter((d) => d.classId === params.classId);
    if (params?.academicYearId) list = list.filter((d) => d.academicYearId === params.academicYearId);
    if (params?.studentId) list = list.filter((d) => d.studentId === params.studentId);
    return list;
  }

  public recordAcademicDecision(
    data: Omit<AcademicDecision, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): AcademicDecision {
    return this.createAcademicDecision(data, user);
  }

  public createAcademicDecision(
    data: Omit<AcademicDecision, 'id' | 'createdAt' | 'updatedAt'>,
    user?: User | null
  ): AcademicDecision {
    const now = new Date().toISOString();
    const newDec: AcademicDecision = {
      ...data,
      id: generateId('dec'),
      createdAt: now,
      updatedAt: now,
    };

    this.state.academicDecisions.unshift(newDec);

    // Update status profil siswa jika kelulusan atau kenaikan kelas
    const student = this.getStudentProfileById(data.studentId);
    if (student) {
      if (data.type === 'GRADUATION' && data.result === 'GRADUATED') {
        student.status = 'GRADUATED';
      } else if (data.type === 'PROMOTION' && data.result === 'PROMOTED' && data.targetClassId) {
        student.currentClassId = data.targetClassId;
      }
    }

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'ACADEMIC_DECISION_COMMIT',
      entity: 'ACADEMIC_DECISION',
      entityId: newDec.id,
      details: `Keputusan pleno: Siswa ${data.studentName} ditetapkan ${data.result} (${data.type})`,
    });

    this.saveState();
    return newDec;
  }

  public updateAcademicDecision(
    id: string,
    data: Partial<AcademicDecision>,
    user?: User | null
  ): AcademicDecision | null {
    const idx = this.state.academicDecisions.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    this.state.academicDecisions[idx] = {
      ...this.state.academicDecisions[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState();
    return this.state.academicDecisions[idx];
  }

  // ===========================================================================
  // PHASE 5: NOTIFIKASI AKADEMIK INTERNAL
  // ===========================================================================

  public getNotifications(firstParam?: string, secondParam?: string): Notification[] {
    let list = [...this.state.notifications];
    if (!firstParam) return list;
    if (secondParam) {
      list = list.filter(
        (n) =>
          (n.userId === firstParam && n.tenantId === secondParam) ||
          (n.tenantId === firstParam && n.userId === secondParam) ||
          n.userId === firstParam ||
          n.userId === secondParam
      );
    } else {
      list = list.filter((n) => n.userId === firstParam || n.tenantId === firstParam);
    }
    return list;
  }

  public createNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      ...data,
      id: generateId('notif'),
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.state.notifications.unshift(newNotif);
    this.saveState();
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    this.saveState();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): boolean {
    this.state.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.saveState();
    return true;
  }

  // ===========================================================================
  // SEED RESET
  // ===========================================================================

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
      // Phase 5 defaults
      attendanceSessions: [...INITIAL_ATTENDANCE_SESSIONS],
      studentAttendances: [...INITIAL_STUDENT_ATTENDANCES],
      staffAttendances: [...INITIAL_STAFF_ATTENDANCES],
      leaveRequests: [...INITIAL_LEAVE_REQUESTS],
      assessmentComponents: [...INITIAL_ASSESSMENT_COMPONENTS],
      studentAssessments: [...INITIAL_STUDENT_ASSESSMENTS],
      gradeRevisions: [...INITIAL_GRADE_REVISIONS],
      questionBanks: [...INITIAL_QUESTION_BANKS],
      questions: [...INITIAL_QUESTIONS],
      examinations: [...INITIAL_EXAMINATIONS],
      examSubmissions: [...INITIAL_EXAM_SUBMISSIONS],
      reportCards: [...INITIAL_REPORT_CARDS],
      semesterResults: [...INITIAL_SEMESTER_RESULTS],
      universityTranscripts: [...INITIAL_UNIVERSITY_TRANSCRIPTS],
      academicDecisions: [...INITIAL_ACADEMIC_DECISIONS],
      notifications: [...INITIAL_NOTIFICATIONS],
    };

    this.addAuditLog({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'SYSTEM_RESET_SEED',
      entity: 'SYSTEM',
      details: 'Mengembalikan seluruh data CMS ke seed bawaan Phase 5 Absensi, Penilaian, Ujian, dan Rapor',
    });

    this.saveState();
  }
}

export const cmsStore = new CmsStore();
export const cmsDb = cmsStore;
