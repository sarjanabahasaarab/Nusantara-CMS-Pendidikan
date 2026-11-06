/**
 * Nusantara Education CMS - Unit Tests
 * Phase 4 - Multi-Tenant SaaS Architecture & Academic Curriculum System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cmsStore } from '../../src/lib/db';
import { canAccessTenant, filterByTenant } from '../../src/lib/permissions';
import { User, Tenant, TeachingAssignment, ScheduleItem } from '../../src/types';

describe('Phase 4: Multi-Tenant SaaS & Academic Curriculum Unit Tests', () => {
  const K12_TENANT = 'tenant-sman-nusantara';
  const KAMPUS_TENANT = 'tenant-politeknik-nusantara';

  describe('1. Multi-Tenant Architecture & Data Isolation', () => {
    it('should load initial seed tenants (K-12 and Higher Education)', () => {
      const tenants = cmsStore.getTenants();
      expect(tenants.length).toBeGreaterThanOrEqual(2);

      const k12 = tenants.find((t) => t.id === K12_TENANT);
      expect(k12).toBeDefined();
      expect(k12?.institutionType || k12?.type).toBe('SMA');
      expect(k12?.status).toBe('ACTIVE');

      const campus = tenants.find((t) => t.id === KAMPUS_TENANT);
      expect(campus).toBeDefined();
      expect(campus?.institutionType || campus?.type).toBe('POLITEKNIK');
    });

    it('should strictly isolate academic data between different tenants', () => {
      // Query classes for SMAN 1 Nusantara
      const k12Classes = cmsStore.getAcademicClasses(K12_TENANT);
      expect(k12Classes.length).toBeGreaterThan(0);
      k12Classes.forEach((c) => {
        expect(c.tenantId).toBe(K12_TENANT);
        expect(c.tenantId).not.toBe(KAMPUS_TENANT);
      });

      // Query classes for Politeknik Nusantara
      const campusClasses = cmsStore.getAcademicClasses(KAMPUS_TENANT);
      expect(campusClasses.length).toBeGreaterThan(0);
      campusClasses.forEach((c) => {
        expect(c.tenantId).toBe(KAMPUS_TENANT);
        expect(c.tenantId).not.toBe(K12_TENANT);
      });

      // Query subjects for both tenants
      const k12Subjects = cmsStore.getSubjects(K12_TENANT);
      const campusSubjects = cmsStore.getSubjects(KAMPUS_TENANT);
      expect(k12Subjects.some((s) => s.tenantId === KAMPUS_TENANT)).toBe(false);
      expect(campusSubjects.some((s) => s.tenantId === K12_TENANT)).toBe(false);
    });

    it('should enforce canAccessTenant logic for Super Admin and regular members', () => {
      const superAdminUser: User = {
        id: 'user-sa',
        tenantId: K12_TENANT,
        name: 'Super Admin',
        email: 'sa@platform.id',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      const regularTeacher: User = {
        id: 'user-guru',
        tenantId: K12_TENANT,
        name: 'Guru SMAN',
        email: 'guru@sman.id',
        role: 'GURU',
        roles: ['GURU'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      const memberships = cmsStore.getTenantMemberships();

      // Super admin can access any tenant
      expect(canAccessTenant(superAdminUser, K12_TENANT, memberships)).toBe(true);
      expect(canAccessTenant(superAdminUser, KAMPUS_TENANT, memberships)).toBe(true);
      expect(canAccessTenant(superAdminUser, 'tenant-random-any', memberships)).toBe(true);

      // Regular teacher can access own tenant, but NOT another tenant
      expect(canAccessTenant(regularTeacher, K12_TENANT, memberships)).toBe(true);
      expect(canAccessTenant(regularTeacher, KAMPUS_TENANT, memberships)).toBe(false);
    });

    it('should filter items properly using filterByTenant utility', () => {
      const testItems = [
        { id: '1', tenantId: K12_TENANT, name: 'Item SMAN' },
        { id: '2', tenantId: KAMPUS_TENANT, name: 'Item Kampus' },
      ];

      // Regular tenant filter
      const filteredForK12 = filterByTenant(testItems, K12_TENANT, false);
      expect(filteredForK12.length).toBe(1);
      expect(filteredForK12[0].name).toBe('Item SMAN');

      // Super Admin bypass filter
      const superAdminView = filterByTenant(testItems, K12_TENANT, true);
      expect(superAdminView.length).toBe(2);
    });
  });

  describe('2. Self-Service Institution Registration & Quota Subscriptions', () => {
    it('should successfully register a new institution with owner, settings, subscription, and default academic year', () => {
      const uniqueSuffix = Date.now().toString().slice(-6);
      const subdomain = `smk-merdeka-${uniqueSuffix}`;
      const adminEmail = `kepala@merdeka-${uniqueSuffix}.sch.id`;

      const result = cmsStore.registerInstitution({
        institutionName: `SMK Merdeka Nusantara ${uniqueSuffix}`,
        institutionType: 'SMK',
        npsn: `1089${uniqueSuffix}`,
        subdomain,
        educationLevel: 'SMK',
        adminName: 'Drs. Hendro Wibowo',
        adminEmail,
        adminPhone: '081399887766',
        password: 'PasswordRahasia123!',
      });

      expect(result).toBeDefined();
      expect(result.tenant.id).toBeDefined();
      expect(result.tenant.name).toContain('SMK Merdeka');
      expect(result.tenant.institutionType || result.tenant.type).toBe('SMK');
      expect(result.adminUser.email).toBe(adminEmail);
      expect(result.adminUser.roles).toContain('ADMIN_SEKOLAH');
      expect(result.membership.role).toBe('OWNER');
      expect(result.subscription.plan || result.subscription.tier).toBe('FREE');
      expect(result.academicYear.isActive).toBe(true);

      // Verify tenant can be retrieved from store
      const retrievedTenant = cmsStore.getTenantById(result.tenant.id);
      expect(retrievedTenant).toBeDefined();
      expect(retrievedTenant?.name).toBe(result.tenant.name);
    });

    it('should reject registration with duplicate subdomain', () => {
      expect(() => {
        cmsStore.registerInstitution({
          institutionName: 'SMAN Duplicate Test',
          institutionType: 'SMA',
          subdomain: 'sman-nusantara', // Already used by default seed
          educationLevel: 'SMA',
          adminName: 'Admin Duplikat',
          adminEmail: `unique.${Date.now()}@test.id`,
          password: 'Password123!',
        });
      }).toThrow(/subdomain.*sudah digunakan/i);
    });

    it('should manage subscriptions and check tenant quotas', () => {
      const sub = cmsStore.getSubscription(K12_TENANT);
      expect(sub).toBeDefined();
      expect(sub?.maxStudents).toBeGreaterThan(0);

      // Upgrade subscription to ENTERPRISE
      const updatedSub = cmsStore.updateSubscription(K12_TENANT, {
        plan: 'ENTERPRISE',
        tier: 'ENTERPRISE',
        maxUsers: 500,
        maxStudents: 5000,
        customDomainAllowed: true,
        apiAccessAllowed: true,
      });

      expect(updatedSub.tier || updatedSub.plan).toBe('ENTERPRISE');
      expect(updatedSub.maxStudents).toBe(5000);
      expect(updatedSub.apiAccessAllowed).toBe(true);
    });
  });

  describe('3. Academic Year & Semester Activation', () => {
    it('should maintain single-active academic year rule', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      expect(years.length).toBeGreaterThan(0);

      // Create a new future academic year
      const newYear = cmsStore.createAcademicYear({
        tenantId: K12_TENANT,
        name: '2026/2027',
        startDate: '2026-07-15',
        endDate: '2027-06-25',
        isActive: false,
      });

      expect(newYear.isActive).toBe(false);

      // Now activate the new year
      const activatedYear = cmsStore.setActiveAcademicYear(newYear.id, K12_TENANT);
      expect(activatedYear.isActive).toBe(true);

      // Check all other years are now INACTIVE
      const allYears = cmsStore.getAcademicYears(K12_TENANT);
      const activeYears = allYears.filter((y) => y.isActive);
      expect(activeYears.length).toBe(1);
      expect(activeYears[0].id).toBe(newYear.id);
    });

    it('should activate academic terms (semester) properly', () => {
      const terms = cmsStore.getAcademicTerms(K12_TENANT);
      if (terms.length > 1) {
        const targetTerm = terms[1];
        const activated = cmsStore.setActiveAcademicTerm(targetTerm.id, K12_TENANT);
        expect(activated.isActive).toBe(true);

        const activeTermsInYear = cmsStore
          .getAcademicTerms(K12_TENANT)
          .filter((t) => t.academicYearId === targetTerm.academicYearId && t.isActive);
        expect(activeTermsInYear.length).toBe(1);
      }
    });
  });

  describe('4. Academic Hierarchy, Rooms & Curriculum Management', () => {
    it('should create and retrieve rooms with facility tags and capacity', () => {
      const newRoom = cmsStore.createRoom({
        tenantId: K12_TENANT,
        code: 'LAB-AI-1',
        name: 'Laboratorium Kecerdasan Buatan',
        type: 'LABORATORY',
        capacity: 40,
        facilities: ['AC', 'Projektor 4K', '40 PC Workstation', 'High-Speed LAN'],
        building: 'Gedung Sains & Komputer Lt. 2',
        isAvailable: true,
      });

      expect(newRoom.id).toBeDefined();
      expect(newRoom.code).toBe('LAB-AI-1');
      expect(newRoom.facilities).toContain('40 PC Workstation');

      const roomInStore = cmsStore.getRooms(K12_TENANT).find((r) => r.id === newRoom.id);
      expect(roomInStore).toBeDefined();
      expect(roomInStore?.capacity).toBe(40);
    });

    it('should manage subjects with SKS / Jam Pelajaran and KKM', () => {
      const newSubject = cmsStore.createSubject({
        tenantId: K12_TENANT,
        code: 'INF-10',
        name: 'Informatika & Rekayasa Perangkat Lunak',
        creditHours: 3,
        minPassingGrade: 78,
        category: 'PEMINATAN',
        isActive: true,
      });

      expect(newSubject.creditHours).toBe(3);
      expect(newSubject.minPassingGrade).toBe(78);
    });

    it('should support Kurikulum Merdeka with Capaian (CP) and Tujuan Pembelajaran (TP)', () => {
      const curriculums = cmsStore.getCurriculums(K12_TENANT);
      expect(curriculums.length).toBeGreaterThan(0);

      const merdeka = curriculums.find((c) => c.curriculumType === 'MERDEKA');
      expect(merdeka).toBeDefined();

      const currSubjects = cmsStore.getCurriculumSubjects(merdeka!.id);
      expect(currSubjects.length).toBeGreaterThan(0);
      expect(currSubjects[0].learningOutcomes).toBeDefined();
      expect(currSubjects[0].learningObjectives).toBeDefined();
    });
  });

  describe('5. Three-Way Conflict Scheduling Engine', () => {
    it('should successfully detect and prevent Teacher Schedule Conflict (bentrok jadwal guru)', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];
      const terms = cmsStore.getAcademicTerms(K12_TENANT);
      const activeTerm = terms[0];
      const classes = cmsStore.getAcademicClasses(K12_TENANT);
      const rooms = cmsStore.getRooms(K12_TENANT);
      const subjects = cmsStore.getSubjects(K12_TENANT);

      const teacherId = 'teacher-dewi';
      const dayOfWeek = 1; // Senin
      const startTime = '07:30';
      const endTime = '09:00';

      // Create first valid schedule
      const firstSchedule = cmsStore.createScheduleItem({
        tenantId: K12_TENANT,
        academicYearId: activeYear.id,
        academicTermId: activeTerm.id,
        classId: classes[0].id,
        subjectId: subjects[0].id,
        teacherId,
        teacherName: 'Dewi Lestari, M.Pd',
        className: classes[0].name,
        subjectName: subjects[0].name,
        roomId: rooms[0].id,
        roomCode: rooms[0].code,
        dayOfWeek,
        startTime,
        endTime,
      });

      expect(firstSchedule.id).toBeDefined();

      // Attempt to schedule the SAME teacher in a DIFFERENT class at overlapping time (08:00 - 09:30)
      expect(() => {
        cmsStore.createScheduleItem({
          tenantId: K12_TENANT,
          academicYearId: activeYear.id,
          academicTermId: activeTerm.id,
          classId: classes[1].id, // Different class
          subjectId: subjects[0].id,
          teacherId, // SAME teacher
          teacherName: 'Dewi Lestari, M.Pd',
          className: classes[1].name,
          subjectName: subjects[0].name,
          roomId: rooms[1]?.id || rooms[0].id,
          roomCode: rooms[1]?.code || rooms[0].code,
          dayOfWeek, // SAME day
          startTime: '08:00', // Overlaps with 07:30-09:00
          endTime: '09:30',
        });
      }).toThrow(/Bentrok Guru/i);
    });

    it('should successfully detect and prevent Class Schedule Conflict (bentrok jadwal rombel/kelas)', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];
      const terms = cmsStore.getAcademicTerms(K12_TENANT);
      const activeTerm = terms[0];
      const classes = cmsStore.getAcademicClasses(K12_TENANT);
      const rooms = cmsStore.getRooms(K12_TENANT);
      const subjects = cmsStore.getSubjects(K12_TENANT);

      const classId = classes[0].id;
      const dayOfWeek = 2; // Selasa

      // First schedule for this class
      cmsStore.createScheduleItem({
        tenantId: K12_TENANT,
        academicYearId: activeYear.id,
        academicTermId: activeTerm.id,
        classId,
        className: classes[0].name,
        subjectId: subjects[0].id,
        subjectName: subjects[0].name,
        teacherId: 'teacher-dewi',
        teacherName: 'Dewi Lestari, M.Pd',
        roomId: rooms[0].id,
        roomCode: rooms[0].code,
        dayOfWeek,
        startTime: '10:00',
        endTime: '11:30',
      });

      // Attempt to schedule the SAME class with a DIFFERENT teacher at overlapping time
      expect(() => {
        cmsStore.createScheduleItem({
          tenantId: K12_TENANT,
          academicYearId: activeYear.id,
          academicTermId: activeTerm.id,
          classId, // SAME class
          className: classes[0].name,
          subjectId: subjects[1]?.id || subjects[0].id,
          subjectName: subjects[1]?.name || subjects[0].name,
          teacherId: 'teacher-hendra', // Different teacher
          teacherName: 'Hendra Setiawan, S.Pd',
          roomId: rooms[1]?.id || rooms[0].id,
          roomCode: rooms[1]?.code || rooms[0].code,
          dayOfWeek,
          startTime: '10:30', // Overlaps with 10:00-11:30
          endTime: '12:00',
        });
      }).toThrow(/Bentrok Rombel/i);
    });

    it('should successfully detect and prevent Room Booking Conflict (bentrok ruangan/fasilitas)', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];
      const terms = cmsStore.getAcademicTerms(K12_TENANT);
      const activeTerm = terms[0];
      const classes = cmsStore.getAcademicClasses(K12_TENANT);
      const rooms = cmsStore.getRooms(K12_TENANT);
      const subjects = cmsStore.getSubjects(K12_TENANT);

      const roomId = rooms[0].id;
      const dayOfWeek = 3; // Rabu

      // First booking of this room
      cmsStore.createScheduleItem({
        tenantId: K12_TENANT,
        academicYearId: activeYear.id,
        academicTermId: activeTerm.id,
        classId: classes[0].id,
        className: classes[0].name,
        subjectId: subjects[0].id,
        subjectName: subjects[0].name,
        teacherId: 'teacher-dewi',
        teacherName: 'Dewi Lestari, M.Pd',
        roomId,
        roomCode: rooms[0].code,
        dayOfWeek,
        startTime: '13:00',
        endTime: '14:30',
      });

      // Attempt to book the SAME room with DIFFERENT class and DIFFERENT teacher
      expect(() => {
        cmsStore.createScheduleItem({
          tenantId: K12_TENANT,
          academicYearId: activeYear.id,
          academicTermId: activeTerm.id,
          classId: classes[1].id, // Different class
          className: classes[1].name,
          subjectId: subjects[1]?.id || subjects[0].id,
          subjectName: subjects[1]?.name || subjects[0].name,
          teacherId: 'teacher-hendra', // Different teacher
          teacherName: 'Hendra Setiawan, S.Pd',
          roomId, // SAME room
          roomCode: rooms[0].code,
          dayOfWeek,
          startTime: '13:30', // Overlaps with 13:00-14:30
          endTime: '15:00',
        });
      }).toThrow(/Bentrok Ruang Belajar/i);
    });

    it('should permit scheduling at non-overlapping times or different days', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];
      const terms = cmsStore.getAcademicTerms(K12_TENANT);
      const activeTerm = terms[0];
      const classes = cmsStore.getAcademicClasses(K12_TENANT);
      const rooms = cmsStore.getRooms(K12_TENANT);
      const subjects = cmsStore.getSubjects(K12_TENANT);

      // Same teacher and room, but completely non-overlapping time slot (14:30 - 16:00 vs 13:00 - 14:30)
      const nonOverlappingSchedule = cmsStore.createScheduleItem({
        tenantId: K12_TENANT,
        academicYearId: activeYear.id,
        academicTermId: activeTerm.id,
        classId: classes[1].id,
        className: classes[1].name,
        subjectId: subjects[0].id,
        subjectName: subjects[0].name,
        teacherId: 'teacher-dewi',
        teacherName: 'Dewi Lestari, M.Pd',
        roomId: rooms[0].id,
        roomCode: rooms[0].code,
        dayOfWeek: 3, // Rabu
        startTime: '14:30',
        endTime: '16:00',
      });

      expect(nonOverlappingSchedule).toBeDefined();
      expect(nonOverlappingSchedule.id).toBeDefined();
    });
  });

  describe('6. Teaching Assignments & 24-Hour National Workload Tracker', () => {
    it('should calculate teacher workload correctly against the 24-hour national certification standard', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];

      // Teacher Dewi has seed assignments
      const totalHours = cmsStore.getTeacherTotalHours('teacher-dewi', activeYear.id, K12_TENANT);
      expect(typeof totalHours).toBe('number');
      expect(totalHours).toBeGreaterThanOrEqual(0);

      // Add another assignment to reach or exceed 24 hours
      const classes = cmsStore.getAcademicClasses(K12_TENANT);
      const subjects = cmsStore.getSubjects(K12_TENANT);

      cmsStore.createTeachingAssignment({
        tenantId: K12_TENANT,
        teacherId: 'teacher-dewi',
        teacherName: 'Dewi Lestari, M.Pd',
        subjectId: subjects[0].id,
        subjectName: subjects[0].name,
        classId: classes[1].id,
        className: classes[1].name,
        academicYearId: activeYear.id,
        hoursPerWeek: 12,
        isCoordinator: true,
      });

      const updatedHours = cmsStore.getTeacherTotalHours('teacher-dewi', activeYear.id, K12_TENANT);
      expect(updatedHours).toBe(totalHours + 12);
      expect(updatedHours).toBeGreaterThanOrEqual(12);
    });
  });

  describe('7. Learning Documents Approval Workflow (RPP, Modul, Silabus, RPS)', () => {
    it('should follow full lifecycle: DRAFT -> SUBMITTED -> APPROVED with reviewer logs', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];
      const subjects = cmsStore.getSubjects(K12_TENANT);

      // 1. Teacher creates Draft
      const doc = cmsStore.createLearningDocument({
        tenantId: K12_TENANT,
        title: 'Modul Ajar Pertemuan 1 - 4 Berpikir Komputasional',
        documentType: 'MODUL_AJAR',
        subjectId: subjects[0].id,
        academicYearId: activeYear.id,
        authorId: 'teacher-dewi',
        authorName: 'Dewi Lestari, M.Pd',
        summary: 'Perangkat ajar kurikulum merdeka fase E',
      });

      expect(doc.status).toBe('DRAFT');

      // 2. Teacher submits for approval
      const submittedDoc = cmsStore.submitLearningDocument(doc.id, {
        id: 'teacher-dewi',
        name: 'Dewi Lestari, M.Pd',
        role: 'GURU',
      } as any);
      expect(submittedDoc?.status).toBe('SUBMITTED');

      // 3. Supervisor approves document
      const approvedDoc = cmsStore.approveLearningDocument(
        doc.id,
        {
          id: 'kepsek-1',
          name: 'Dr. H. Ahmad Dahlan, M.Pd',
          role: 'KEPALA_SEKOLAH',
        } as any
      );
      expect(approvedDoc?.status).toBe('APPROVED');
      expect(approvedDoc?.approvedBy).toBe('Dr. H. Ahmad Dahlan, M.Pd');
      expect(approvedDoc?.approvedAt).toBeDefined();
    });

    it('should support revision request with supervisor feedback notes', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];
      const subjects = cmsStore.getSubjects(K12_TENANT);

      const doc = cmsStore.createLearningDocument({
        tenantId: K12_TENANT,
        title: 'RPP Diferensiasi Matematika Diskrit',
        documentType: 'RPP',
        subjectId: subjects[0].id,
        academicYearId: activeYear.id,
        authorId: 'teacher-dewi',
        authorName: 'Dewi Lestari, M.Pd',
      });

      const revisedDoc = cmsStore.requestRevisionLearningDocument(
        doc.id,
        {
          id: 'kepsek-1',
          name: 'Dr. H. Ahmad Dahlan, M.Pd',
          role: 'KEPALA_SEKOLAH',
        } as any,
        'Mohon tambahkan rubrik asesmen formatif untuk kegiatan kelompok.'
      );

      expect(revisedDoc?.status).toBe('REVISION');
      expect(revisedDoc?.feedbackNotes || revisedDoc?.revisionNotes).toContain('rubrik asesmen');
    });
  });

  describe('8. Academic Calendar & Institutional Agenda', () => {
    it('should create and retrieve academic calendar events per tenant', () => {
      const years = cmsStore.getAcademicYears(K12_TENANT);
      const activeYear = years.find((y) => y.isActive) || years[0];

      const newEvent = cmsStore.createAcademicCalendarEvent({
        tenantId: K12_TENANT,
        academicYearId: activeYear.id,
        title: 'Asesmen Sumatif Akhir Semester Genap',
        category: 'EXAM',
        startDate: '2026-06-01',
        endDate: '2026-06-12',
        description: 'Ujian berbasis komputer (CBT) serentak',
        isHoliday: false,
      });

      expect(newEvent.id).toBeDefined();
      expect(newEvent.category).toBe('EXAM');

      const events = cmsStore.getAcademicCalendarEvents(K12_TENANT);
      expect(events.some((e) => e.id === newEvent.id)).toBe(true);
    });
  });
});
