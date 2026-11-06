/**
 * Nusantara Education CMS - Unit Tests
 * Phase 3 - Advanced User Management, Educational Profiles & Granular RBAC
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cmsStore } from '../../src/lib/db';
import {
  getUserEffectivePermissions,
  hasPermission,
  hasAnyPermission,
  canViewStudentData,
} from '../../src/lib/permissions';
import { User, Role, TeacherProfile, StudentProfile } from '../../src/types';

describe('Phase 3: Advanced User Management & RBAC Unit Tests', () => {
  beforeEach(() => {
    // Fresh store state is automatically seeded with default educational data
  });

  describe('1. User Management & Security Protections', () => {
    it('should create new user with valid email and prevent duplicate emails', () => {
      const email = `guru.test.${Date.now()}@nusantara.sch.id`;
      const newUser = cmsStore.createUser({
        name: 'Budi Santoso M.Pd',
        email,
        phone: '081234567899',
        roles: ['GURU'],
        status: 'ACTIVE',
      });

      expect(newUser).toBeDefined();
      expect(newUser.email).toBe(email);
      expect(newUser.roles).toContain('GURU');
      expect(newUser.role).toBe('GURU');

      // Duplicate email attempt must throw
      expect(() => {
        cmsStore.createUser({
          name: 'Clone User',
          email,
          roles: ['GURU'],
        });
      }).toThrow(/telah terdaftar/i);
    });

    it('should strictly protect SUPER_ADMIN from deletion', () => {
      const superAdmin = cmsStore.getUsers().find((u) => u.roles.includes('SUPER_ADMIN'));
      expect(superAdmin).toBeDefined();

      if (superAdmin) {
        expect(() => {
          cmsStore.deleteUser(superAdmin.id);
        }).toThrow(/SUPER_ADMIN.*tidak dapat dihapus/i);
      }
    });

    it('should strictly protect SUPER_ADMIN from being blocked', () => {
      const superAdmin = cmsStore.getUsers().find((u) => u.roles.includes('SUPER_ADMIN'));
      expect(superAdmin).toBeDefined();

      if (superAdmin) {
        expect(() => {
          cmsStore.blockUser(superAdmin.id, 'Percobaan blokir');
        }).toThrow(/SUPER_ADMIN tidak dapat diblokir/);
      }
    });

    it('should allow blocking and unblocking standard users', () => {
      const user = cmsStore.createUser({
        name: 'User Untuk Diblokir',
        email: `block.test.${Date.now()}@nusantara.sch.id`,
        roles: ['SISWA'],
        status: 'ACTIVE',
      });

      // Block user
      const blocked = cmsStore.blockUser(user.id, 'Pelanggaran tata tertib');
      expect(blocked.status).toBe('BLOCKED');
      expect(blocked.isActive).toBe(false);

      // Unblock user
      const unblocked = cmsStore.unblockUser(user.id);
      expect(unblocked.status).toBe('ACTIVE');
      expect(unblocked.isActive).toBe(true);
    });
  });

  describe('2. Role Management & Deletion Guards', () => {
    it('should prevent deletion of protected system roles', () => {
      expect(() => {
        cmsStore.deleteRole('role-superadmin');
      }).toThrow(/role sistem bawaan/i);

      expect(() => {
        cmsStore.deleteRole('role-guru');
      }).toThrow(/role sistem bawaan/i);
    });

    it('should create custom role and prevent deletion if still in use by active users', () => {
      const customRole = cmsStore.createRole({
        name: 'PEMBINA_OSIS',
        code: 'PEMBINA_OSIS',
        description: 'Guru pembina kegiatan kesiswaan OSIS',
        permissions: ['students.view', 'events.manage'],
      });

      expect(customRole).toBeDefined();
      expect(customRole.name).toBe('PEMBINA_OSIS');

      // Create a user with this custom role
      const pembina = cmsStore.createUser({
        name: 'Pak Pembina',
        email: `pembina.${Date.now()}@nusantara.sch.id`,
        roles: ['PEMBINA_OSIS', 'GURU'],
      });

      // Attempt deletion while role is in use
      expect(() => {
        cmsStore.deleteRole(customRole.id);
      }).toThrow(/sedang digunakan oleh/);

      // Reassign user to another role
      cmsStore.updateUser(pembina.id, { roles: ['GURU'] });

      // Now deletion should succeed
      const deleteResult = cmsStore.deleteRole(customRole.id);
      expect(deleteResult).toBe(true);
    });
  });

  describe('3. Multi-Role Support & Union Permission Evaluation', () => {
    it('should calculate permission union for users with multiple roles', () => {
      // Guru biasa
      const pureGuru: User = {
        id: 'test-guru',
        name: 'Guru Fisika',
        email: 'guru.fisika@test.com',
        role: 'GURU',
        roles: ['GURU'],
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(hasPermission(pureGuru, 'teachers.view')).toBe(true);
      expect(hasPermission(pureGuru, 'homeroom.manage')).toBe(false);
      expect(hasPermission(pureGuru, 'users.create')).toBe(false);

      // Guru sekaligus Wali Kelas (Multi-role)
      const guruWaliKelas: User = {
        id: 'test-guru-walikelas',
        name: 'Ahmad Fauzi M.Pd',
        email: 'fauzi@test.com',
        role: 'GURU',
        roles: ['GURU', 'WALI_KELAS'],
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const effectivePerms = getUserEffectivePermissions(guruWaliKelas);
      expect(effectivePerms).toContain('teachers.view');
      expect(effectivePerms).toContain('homeroom.view');
      expect(effectivePerms).toContain('reports.view');

      expect(hasPermission(guruWaliKelas, 'homeroom.view')).toBe(true);
      expect(hasPermission(guruWaliKelas, 'reports.view')).toBe(true);
      expect(hasPermission(guruWaliKelas, 'teachers.view')).toBe(true);
      expect(hasPermission(guruWaliKelas, 'users.create')).toBe(false);
    });

    it('should grant all permissions if any role is SUPER_ADMIN', () => {
      const superAdminUser: User = {
        id: 'test-sa',
        name: 'Super Administrator',
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN', 'GURU'],
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(hasPermission(superAdminUser, 'users.delete')).toBe(true);
      expect(hasPermission(superAdminUser, 'roles.delete')).toBe(true);
      expect(hasPermission(superAdminUser, 'settings.update')).toBe(true);
      expect(hasPermission(superAdminUser, 'permissions.manage')).toBe(true);
    });
  });

  describe('4. Homeroom Constraint: Single Active Teacher Per Class & Academic Year', () => {
    it('should enforce only 1 active homeroom teacher per class and year', () => {
      const teacher1 = cmsStore.getTeacherProfiles()[0];
      const teacher2 = cmsStore.getTeacherProfiles()[1];
      expect(teacher1).toBeDefined();
      expect(teacher2).toBeDefined();

      const uniqueClass = `TEST-ROMBEL-${Date.now()}`;
      const year = '2026/2027 Ganjil';

      // Assign teacher 1 to this class
      const assign1 = cmsStore.createHomeroomAssignment({
        teacherId: teacher1.id,
        classId: uniqueClass,
        className: uniqueClass,
        academicYearId: 'year-2026-ganjil',
        academicYearName: year,
        startDate: '2026-07-01',
      });

      expect(assign1).toBeDefined();
      expect(assign1.isActive).toBe(true);

      // Attempt to assign teacher 2 to the same class in the same year while active
      expect(() => {
        cmsStore.createHomeroomAssignment({
          teacherId: teacher2.id,
          classId: uniqueClass,
          className: uniqueClass,
          academicYearId: 'year-2026-ganjil',
          academicYearName: year,
          startDate: '2026-07-01',
        });
      }).toThrow(/sudah memiliki wali kelas aktif/);
    });
  });

  describe('5. Student Profiles, Uniqueness & Soft Archive', () => {
    it('should reject duplicate NIS for students', () => {
      const nis = `NIS${Date.now()}`;
      const s1 = cmsStore.createStudentProfile({
        userId: 'temp-1',
        fullName: 'Siswa Test 1',
        nis,
        nisn: `00${Date.now()}`,
        className: 'X-A',
        gender: 'L',
      });
      expect(s1).toBeDefined();

      // Duplicate NIS attempt
      expect(() => {
        cmsStore.createStudentProfile({
          userId: 'temp-2',
          fullName: 'Siswa Test 2',
          nis, // duplicate!
          gender: 'P',
        });
      }).toThrow(/NIS.*sudah terdaftar/);
    });

    it('should soft-archive student profile upon deletion to preserve grades history', () => {
      const student = cmsStore.createStudentProfile({
        userId: 'temp-soft',
        fullName: 'Siswa Mutasi',
        nis: `MUTASI-${Date.now()}`,
        className: 'XI-IPA',
        gender: 'L',
      });

      expect(student.status).toBe('AKTIF');

      // Delete student profile
      cmsStore.deleteStudentProfile(student.id);

      // Profile is not destroyed, but marked nonaktif for academic preservation
      const archived = cmsStore.getStudentProfiles().find((s) => s.id === student.id);
      expect(archived).toBeDefined();
      expect(archived?.status).toBe('NONAKTIF');
    });
  });

  describe('6. Data Privacy Protections (canViewStudentData)', () => {
    it('should allow student to view own data but disallow viewing other students', () => {
      const student1: User = {
        id: 'student-rizky',
        name: 'Rizky Pratama',
        email: 'rizky@test.com',
        role: 'SISWA',
        roles: ['SISWA'],
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Own data: Allowed
      expect(canViewStudentData(student1, 'student-rizky')).toBe(true);

      // Other student data: Denied by privacy law
      expect(canViewStudentData(student1, 'student-zahra')).toBe(false);
    });

    it('should allow parent to view ONLY linked student data', () => {
      const parentUser: User = {
        id: 'parent-kartika',
        name: 'Ibu Dr. Kartika Sari',
        email: 'kartika@test.com',
        role: 'ORANG_TUA',
        roles: ['ORANG_TUA'],
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const linkedChildrenIds = ['student-rizky', 'student-zahra'];

      // Linked child: Allowed
      expect(
        canViewStudentData(parentUser, 'student-rizky', {
          userLinkedStudentUserIds: linkedChildrenIds,
        })
      ).toBe(true);

      // Unlinked child: Denied
      expect(
        canViewStudentData(parentUser, 'student-farhan', {
          userLinkedStudentUserIds: linkedChildrenIds,
        })
      ).toBe(false);
    });
  });

  describe('7. Single-Use Invitation & Password Reset Tokens', () => {
    it('should generate one-time invite token and redeem once', () => {
      const invite = cmsStore.createInvitation({
        email: `invite.${Date.now()}@nusantara.sch.id`,
        name: 'Calon Guru Baru',
        roles: ['GURU'],
        invitedBy: 'Super Admin',
      });

      expect(invite.token).toBeDefined();
      expect(invite.status).toBe('PENDING');

      // Accept invitation
      const activatedUser = cmsStore.acceptInvitation(
        invite.token,
        'Budi Baru M.Pd',
        'PasswordBaru123!'
      );

      expect(activatedUser).toBeDefined();
      expect(activatedUser.status).toBe('ACTIVE');
      expect(activatedUser.name).toBe('Budi Baru M.Pd');

      // Second attempt with same token must fail (single-use)
      expect(() => {
        cmsStore.acceptInvitation(invite.token, 'Penyerang', 'HackedPass!');
      }).toThrow(/tidak valid atau sudah kedaluwarsa/);
    });

    it('should generate one-time password reset token and invalidate upon reset', () => {
      const user = cmsStore.getUsers().find((u) => u.roles.includes('GURU'));
      expect(user).toBeDefined();

      if (user) {
        const resetToken = cmsStore.createPasswordResetToken(user.email);
        expect(resetToken.token).toBeDefined();

        // Reset password using token
        const success = cmsStore.resetPasswordWithToken(resetToken.token, 'SandiRahasia999!');
        expect(success).toBe(true);

        // Attempt second reset with same token must fail
        expect(() => {
          cmsStore.resetPasswordWithToken(resetToken.token, 'SandiKedua!');
        }).toThrow(/tidak valid atau telah digunakan/);
      }
    });
  });

  describe('8. Batch CSV Import & Export Engine', () => {
    it('should validate and import teacher records from CSV text', () => {
      const csvText = `Nama,Email,Nomor HP,NIP,Mapel,Status Kepegawaian
Prof. Dr. Suryanto,suryanto.${Date.now()}@nusantara.sch.id,081299887766,197001012000031001,Fisika Modern,PNS
Dra. Mariana,mariana.${Date.now()}@nusantara.sch.id,081399887755,,Biologi Sel,HONORER`;

      const result = cmsStore.batchImportFromCsv('TEACHER', csvText);
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
    });

    it('should detect duplicates and report row-specific errors during CSV import', () => {
      const existingEmail = cmsStore.getUsers()[0].email;
      const csvText = `Nama Lengkap,NIS,NISN,Kelas,Email,Nomor HP
Siswa Duplikat Email,NIS991,00991,X-A,${existingEmail},081200000000`;

      const result = cmsStore.batchImportFromCsv('STUDENT', csvText);
      expect(result.failedCount).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toMatch(/sudah digunakan|sudah terdaftar/);
    });

    it('should export safe CSV data without leaking password hashes or session tokens', () => {
      const csvOutput = cmsStore.exportToCsv('USERS');
      expect(csvOutput).toContain('ID,Nama Lengkap,Alamat Email');
      expect(csvOutput).not.toContain('passwordHash');
      expect(csvOutput).not.toContain('$2b$10$');
      expect(csvOutput).not.toContain('lockedUntil');
    });
  });

  describe('9. Real Database Aggregates (No Dummy Stats)', () => {
    it('should return accurate live statistics matching database records', () => {
      const stats = cmsStore.getUserStats();
      const users = cmsStore.getUsers();

      expect(stats.totalUsers).toBe(users.length);
      expect(stats.activeUsers).toBe(users.filter((u) => u.status === 'ACTIVE').length);
      expect(stats.blockedUsers).toBe(users.filter((u) => u.status === 'BLOCKED').length);
      expect(stats.totalTeachers).toBe(cmsStore.getTeacherProfiles().length);
      expect(stats.totalStudents).toBe(cmsStore.getStudentProfiles().length);
      expect(stats.totalParents).toBe(cmsStore.getParentProfiles().length);
      expect(stats.totalStaff).toBe(cmsStore.getStaffProfiles().length);
    });
  });
});
