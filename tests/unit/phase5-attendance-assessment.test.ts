/**
 * Nusantara Education CMS - Unit Tests
 * Phase 5 - Sistem Absensi, Penilaian, Ujian, dan Rapor Multi-Tenant
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cmsStore } from '../../src/lib/db';
import { User, AttendanceType, LeaveRequestStatus, ExamStatus } from '../../src/types';

describe('Phase 5: Attendance, Assessment, Examination & Report Cards Tests', () => {
  const K12_TENANT = 'tenant-sman-nusantara';
  const KAMPUS_TENANT = 'tenant-politeknik-nusantara';

  const adminUser: User = {
    id: 'user-admin',
    tenantId: K12_TENANT,
    name: 'Administrator',
    email: 'admin@sman1nusantara.sch.id',
    role: 'ADMINISTRATOR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const teacherUser: User = {
    id: 'user-guru',
    tenantId: K12_TENANT,
    name: 'Budi Santoso, M.Pd',
    email: 'budi@sman1nusantara.sch.id',
    role: 'GURU',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset seed for a pristine test state
    cmsStore.resetToSeed(adminUser);
  });

  describe('1. Presensi Siswa & Mahasiswa', () => {
    it('should create attendance session and record student attendances', () => {
      const cls = cmsStore.getAcademicClasses(K12_TENANT)[0];
      const students = cmsStore.getStudents(K12_TENANT);
      expect(students.length).toBeGreaterThan(0);

      const session = cmsStore.createAttendanceSession(
        {
          tenantId: K12_TENANT,
          classId: cls.id,
          className: cls.name,
          date: '2026-11-20',
          sessionType: 'HARIAN',
          title: 'Presensi Pagi Hari Jumat',
          recordedBy: adminUser.id,
          recordedByName: adminUser.name,
          academicYearId: cls.academicYearId,
          semesterId: 'term-1',
          totalStudents: students.length,
          totalPresent: students.length - 1,
          totalAbsent: 1,
        },
        [
          { studentId: students[0].id, status: 'HADIR' },
          { studentId: students[1].id, status: 'SAKIT', notes: 'Demam' },
        ],
        adminUser
      );

      expect(session.id).toBeDefined();
      expect(session.tenantId).toBe(K12_TENANT);

      // Verify attendance records
      const attendances = cmsStore.getStudentAttendances(K12_TENANT, { sessionId: session.id });
      expect(attendances.length).toBe(2);
      expect(attendances.find((a) => a.studentId === students[0].id)?.status).toBe('HADIR');
      expect(attendances.find((a) => a.studentId === students[1].id)?.status).toBe('SAKIT');
    });

    it('should prevent duplicate attendance session on same class, date and session type', () => {
      const cls = cmsStore.getAcademicClasses(K12_TENANT)[0];
      const sessionData = {
        tenantId: K12_TENANT,
        classId: cls.id,
        className: cls.name,
        date: '2026-12-01',
        sessionType: 'HARIAN' as const,
        title: 'Presensi Harian',
        recordedBy: adminUser.id,
        academicYearId: cls.academicYearId,
        semesterId: 'term-1',
        totalStudents: 1,
        totalPresent: 1,
        totalAbsent: 0,
      };

      cmsStore.createAttendanceSession(sessionData, undefined, adminUser);

      // Second attempt with exact same criteria should throw
      expect(() => {
        cmsStore.createAttendanceSession(sessionData, undefined, adminUser);
      }).toThrow(/sudah dibuat sebelumnya/i);
    });

    it('should calculate attendance recap properly', () => {
      const recap = cmsStore.getStudentAttendanceRecap({
        tenantId: K12_TENANT,
      });

      expect(recap).toBeDefined();
      expect(typeof recap.hadir).toBe('number');
      expect(typeof recap.sakit).toBe('number');
      expect(typeof recap.attendancePercentage).toBe('number');
    });
  });

  describe('2. Presensi Guru & Pegawai', () => {
    it('should allow staff clock in and clock out', () => {
      const staffList = cmsStore.getStaffProfiles();
      const staff = staffList[0];
      expect(staff).toBeDefined();

      const clockIn = cmsStore.clockInStaff(
        {
          tenantId: K12_TENANT,
          staffId: staff.id,
          staffType: 'STAFF',
          location: 'Gedung Utama',
        },
        adminUser
      );

      expect(clockIn.id).toBeDefined();
      expect(clockIn.status).toBe('HADIR');
      expect(clockIn.checkInTime).toBeDefined();

      const clockOut = cmsStore.clockOutStaff(clockIn.id, new Date().toISOString(), adminUser);
      expect(clockOut?.checkOutTime).toBeDefined();
    });

    it('should record manual staff attendance with late minutes', () => {
      const manual = cmsStore.recordStaffAttendance(
        {
          tenantId: K12_TENANT,
          staffId: 'staff-sample',
          staffName: 'Staff Sample',
          staffType: 'ADMIN_STAFF',
          date: '2026-11-20',
          status: 'TERLAMBAT',
          lateMinutes: 25,
          notes: 'Macet jalan arteri',
        },
        adminUser
      );

      expect(manual.id).toBeDefined();
      expect(manual.lateMinutes).toBe(25);
    });
  });

  describe('3. Pengajuan Izin & Surat Cuti (Leave Requests)', () => {
    it('should create leave request and process approval workflow', () => {
      const students = cmsStore.getStudents(K12_TENANT);
      const student = students[0];

      const leave = cmsStore.createLeaveRequest(
        {
          tenantId: K12_TENANT,
          studentId: student.id,
          studentName: student.fullName,
          requesterId: student.id,
          requesterName: student.fullName,
          requesterRole: 'SISWA',
          type: 'SAKIT',
          startDate: '2026-11-21',
          endDate: '2026-11-22',
          reason: 'Rawat jalan dokter RSUD',
        },
        adminUser
      );

      expect(leave.id).toBeDefined();
      expect(leave.status).toBe('MENUNGGU');

      // Approving request
      const approved = cmsStore.reviewLeaveRequest(leave.id, 'DISETUJUI', 'Surat dokter terlampir valid', adminUser);
      expect(approved?.status).toBe('DISETUJUI');
      expect(approved?.reviewedBy).toBe(adminUser.id);

      // Verify automated notification was dispatched to requester
      const notifs = cmsStore.getNotifications(student.id, K12_TENANT);
      expect(notifs.some((n) => n.title.includes('DISETUJUI'))).toBe(true);
    });
  });

  describe('4. Penilaian & Kunci Nilai (Assessments & CP/TP)', () => {
    it('should calculate weighted final score and handle grade lock mechanism', () => {
      const subjects = cmsStore.getSubjects(K12_TENANT);
      const subject = subjects[0];
      const students = cmsStore.getStudents(K12_TENANT);
      const student = students[0];

      // Create assessment component
      const comp = cmsStore.createAssessmentComponent(
        {
          tenantId: K12_TENANT,
          subjectId: subject.id,
          subjectName: subject.name,
          name: 'Tugas 1: Analisis Cerpen',
          type: 'TUGAS',
          weight: 40,
          passingGrade: 75,
          learningObjective: 'TP 1.1 Mampu menganalisis unsur intrinsik cerpen',
        },
        adminUser
      );

      // Upsert student grade
      const assessment = cmsStore.upsertStudentAssessment(
        {
          tenantId: K12_TENANT,
          componentId: comp.id,
          studentId: student.id,
          score: 88,
          feedback: 'Analisis mendalam dan argumentasi kuat',
        },
        adminUser
      );

      expect(assessment.score).toBe(88);

      // Lock grades for this component
      cmsStore.toggleLockAssessment(comp.id, true, adminUser);

      // Attempting to modify locked assessment should throw
      expect(() => {
        cmsStore.upsertStudentAssessment(
          {
            tenantId: K12_TENANT,
            componentId: comp.id,
            studentId: student.id,
            score: 95,
          },
          adminUser
        );
      }).toThrow(/telah dikunci/i);

      // Unlock and modify score -> should create grade revision record
      cmsStore.toggleLockAssessment(comp.id, false, adminUser);
      cmsStore.upsertStudentAssessment(
        {
          tenantId: K12_TENANT,
          componentId: comp.id,
          studentId: student.id,
          score: 92,
        },
        adminUser,
        'Koreksi butir esai nomor 4'
      );

      const revisions = cmsStore.getGradeRevisions({ tenantId: K12_TENANT, componentId: comp.id });
      expect(revisions.length).toBeGreaterThan(0);
      expect(revisions[0].oldScore).toBe(88);
      expect(revisions[0].newScore).toBe(92);
      expect(revisions[0].reason).toContain('Koreksi butir esai');
    });
  });

  describe('5. Bank Soal & Ujian CBT Online', () => {
    it('should create question bank and auto-grade objective questions', () => {
      const subjects = cmsStore.getSubjects(K12_TENANT);
      const subject = subjects[0];

      const bank = cmsStore.createQuestionBank(
        {
          tenantId: K12_TENANT,
          subjectId: subject.id,
          subjectName: subject.name,
          name: 'Bank Soal Sumatif Akhir Semester',
          code: 'BANK-SAS-01',
          gradeLevel: '10',
          bloomTaxonomyLevel: 'C4',
        },
        adminUser
      );

      const q1 = cmsStore.createQuestion(
        {
          tenantId: K12_TENANT,
          bankId: bank.id,
          subjectId: subject.id,
          questionType: 'PILIHAN_GANDA',
          prompt: 'Ibukota Negara Republik Indonesia saat ini adalah?',
          options: [
            { id: 'opt-a', text: 'Jakarta', isCorrect: true },
            { id: 'opt-b', text: 'Surabaya', isCorrect: false },
          ],
          scoreWeight: 50,
          difficulty: 'EASY',
        },
        adminUser
      );

      const exam = cmsStore.createExamination(
        {
          tenantId: K12_TENANT,
          subjectId: subject.id,
          subjectName: subject.name,
          classIds: ['cls-sample'],
          title: 'Asesmen Sumatif Bahasa Indonesia',
          mode: 'ONLINE',
          type: 'SAS',
          questionBankId: bank.id,
          questionIds: [q1.id],
          durationMinutes: 60,
          passingGrade: 75,
          status: 'PUBLISHED',
          academicYearId: 'ay-sample',
          semesterId: 'term-sample',
        },
        adminUser
      );

      const students = cmsStore.getStudents(K12_TENANT);
      const student = students[0];

      // Submit correct answer
      const submission = cmsStore.submitExam(
        {
          tenantId: K12_TENANT,
          examId: exam.id,
          studentId: student.id,
          answers: [
            { questionId: q1.id, answer: 'opt-a' },
          ],
        },
        adminUser
      );

      expect(submission.totalScore).toBe(50);
      expect(submission.answers[q1.id]?.isCorrect).toBe(true);
    });
  });

  describe('6. Rapor Sekolah K-12 (Report Cards)', () => {
    it('should generate report card and process multi-tier approvals', () => {
      const cls = cmsStore.getAcademicClasses(K12_TENANT)[0];
      const students = cmsStore.getStudents(K12_TENANT);
      const student = students[0];

      const reportCard = cmsStore.generateReportCard(
        {
          tenantId: K12_TENANT,
          studentId: student.id,
          classId: cls.id,
          academicYearId: cls.academicYearId || 'ay-sample',
          semesterId: 'term-1',
        },
        adminUser
      );

      expect(reportCard.id).toBeDefined();
      expect(reportCard.status).toBe('DRAFT');
      expect(reportCard.items.length).toBeGreaterThan(0);

      // Homeroom checks report card
      const checked = cmsStore.approveReportCard(reportCard.id, 'WALI_KELAS', teacherUser);
      expect(checked?.status).toBe('CHECKED');

      // Principal approves and publishes report card
      const approved = cmsStore.approveReportCard(reportCard.id, 'KEPALA_SEKOLAH', adminUser);
      expect(approved?.status).toBe('APPROVED');
    });
  });

  describe('7. Perguruan Tinggi: KHS, SKS, IPS, IPK & Transkrip Kumulatif', () => {
    it('should calculate university semester results (IPS) and official transcript (IPK)', () => {
      const students = cmsStore.getStudents(KAMPUS_TENANT);
      const student = students[0] || cmsStore.getStudents()[0];

      const khs = cmsStore.calculateAndPublishSemesterResult(
        KAMPUS_TENANT,
        student.id,
        'ay-kampus-2026',
        'term-ganjil',
        adminUser
      );

      expect(khs.id).toBeDefined();
      expect(khs.totalSks).toBeGreaterThan(0);
      expect(khs.ips).toBeGreaterThanOrEqual(0);
      expect(khs.ips).toBeLessThanOrEqual(4.0);

      const transcript = cmsStore.generateUniversityTranscript(KAMPUS_TENANT, student.id, adminUser);
      expect(transcript.id).toBeDefined();
      expect(transcript.isOfficial).toBe(true);
      expect(transcript.ipkCumulative).toBeGreaterThan(0);
    });
  });

  describe('8. Keputusan Akademik (Sidang Pleno Kenaikan Kelas & Kelulusan)', () => {
    it('should record academic promotion decision with SK number', () => {
      const cls = cmsStore.getAcademicClasses(K12_TENANT)[0];
      const students = cmsStore.getStudents(K12_TENANT);
      const student = students[0];

      const decision = cmsStore.recordAcademicDecision(
        {
          tenantId: K12_TENANT,
          classId: cls.id,
          className: cls.name,
          academicYearId: cls.academicYearId || 'ay-2026',
          academicYearName: '2026/2027',
          studentId: student.id,
          studentName: student.fullName,
          type: 'PROMOTION',
          result: 'PROMOTED',
          targetClassId: 'cls-11-ipa-1',
          targetClassName: 'XI MIPA 1',
          skNumber: 'SK/PLENO/04/2026',
          decisionDate: '2026-06-25',
          notes: 'Memenuhi seluruh kriteria ketuntasan minimal dan kehadiran 95%',
        },
        adminUser
      );

      expect(decision.id).toBeDefined();
      expect(decision.skNumber).toBe('SK/PLENO/04/2026');
      expect(decision.result).toBe('PROMOTED');
    });
  });
});
